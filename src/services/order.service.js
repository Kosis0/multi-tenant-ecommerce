const pool = require('../config/db');
const { withTransaction } = require('../config/db');
const { NotFoundError, InsufficientStockError, BadRequestError } = require('../errors');
const { ORDER_STATUS, VALID_ORDER_STATUSES } = require('../constants/orderStatus');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('./email.service');

/**
 * Creates an order inside an isolated transaction with pessimistic row-level locking (FOR UPDATE)
 * and atomic conditional decrements to guarantee zero overselling under high concurrency.
 */
const createOrder = async (tenant, { items, paymentMethod = 'card', email, customer }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Order items are required');
  }

  const customerEmail = customer?.email || email || null;
  const customerId = customer?.customerId || null;

  const createdOrder = await withTransaction(async (client) => {
    let totalAmount = 0;

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT price, stock, title FROM products WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
        [item.product_id, tenant.id]
      );

      if (prodRes.rows.length === 0) {
        throw new NotFoundError(`Product ${item.product_id} not found in this store`);
      }

      const product = prodRes.rows[0];
      let unitPrice = Number(product.price);

      if (item.variant_id) {
        const variantRes = await client.query(
          'SELECT stock, price_adjustment, name, value FROM product_variants WHERE id = $1 AND product_id = $2 FOR UPDATE',
          [item.variant_id, item.product_id]
        );

        if (variantRes.rows.length === 0) {
          throw new NotFoundError(`Variant ${item.variant_id} not found`);
        }

        const variant = variantRes.rows[0];
        if (variant.stock < item.quantity) {
          throw new InsufficientStockError(`Insufficient stock for variant ${variant.name} ${variant.value}`);
        }

        unitPrice += Number(variant.price_adjustment);

        // Atomic decrement with safety condition
        const updateRes = await client.query(
          'UPDATE product_variants SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
          [item.quantity, item.variant_id]
        );

        if (updateRes.rowCount === 0) {
          throw new InsufficientStockError(`Concurrent modification: Insufficient stock for variant ${variant.name} ${variant.value}`);
        }
      } else {
        if (product.stock < item.quantity) {
          throw new InsufficientStockError(`Insufficient stock for product ${product.title}`);
        }

        // Atomic decrement with safety condition
        const updateRes = await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2 AND tenant_id = $3 AND stock >= $1',
          [item.quantity, item.product_id, tenant.id]
        );

        if (updateRes.rowCount === 0) {
          throw new InsufficientStockError(`Concurrent modification: Insufficient stock for product ${product.title}`);
        }
      }

      totalAmount += unitPrice * item.quantity;
      item.calculated_unit_price = unitPrice;
    }

    const orderRes = await client.query(
      `INSERT INTO orders (tenant_id, total_amount, status, created_at, customer_id, customer_email, payment_method) 
       VALUES ($1, $2, $3, NOW(), $4, $5, $6) 
       RETURNING *`,
      [tenant.id, totalAmount, ORDER_STATUS.PENDING, customerId, customerEmail, paymentMethod]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, variant_info) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.calculated_unit_price,
          item.variant_info ? JSON.stringify(item.variant_info) : null
        ]
      );
    }

    const { rows: orderItems } = await client.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    return { ...order, items: orderItems };
  });

  // Async email notification (post-commit)
  if (customerEmail) {
    sendOrderConfirmationEmail(customerEmail, createdOrder, items, createdOrder.total_amount).catch((err) =>
      console.error('[EMAIL ERROR] Failed to send order confirmation:', err.message)
    );
  }

  return createdOrder;
};

/**
 * Retrieves orders for tenant admin with pagination.
 */
const listOrders = async (tenantId, { page = 1, limit = 50 }) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  const countRes = await pool.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [tenantId]);
  const totalItems = parseInt(countRes.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / safeLimit);

  const { rows } = await pool.query(
    `SELECT o.*, 
            COALESCE(json_agg(json_build_object(
              'id', oi.id, 
              'product_id', oi.product_id, 
              'quantity', oi.quantity, 
              'unit_price', oi.unit_price
            )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.tenant_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $2 OFFSET $3`,
    [tenantId, safeLimit, offset]
  );

  return {
    orders: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages
    }
  };
};

/**
 * Updates an order status and dispatches notification emails if marked shipped/delivered.
 */
const updateOrderStatus = async (tenantId, orderId, status) => {
  if (!VALID_ORDER_STATUSES.includes(status)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`);
  }

  const { rows } = await pool.query(
    'UPDATE orders SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
    [status, orderId, tenantId]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Order not found');
  }

  const order = rows[0];

  if (order.customer_email && (status === ORDER_STATUS.SHIPPED || status === ORDER_STATUS.DELIVERED)) {
    sendOrderStatusUpdateEmail(order.customer_email, order.id, status).catch((err) =>
      console.error('[EMAIL ERROR] Failed to send status update email:', err.message)
    );
  }

  return order;
};

/**
 * Marks an order as paid (Admin settlement).
 */
const settleOrder = async (tenantId, orderId) => {
  const { rows } = await pool.query(
    "UPDATE orders SET status = 'paid' WHERE id = $1 AND tenant_id = $2 RETURNING *",
    [orderId, tenantId]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Order not found');
  }

  return rows[0];
};

module.exports = {
  createOrder,
  listOrders,
  updateOrderStatus,
  settleOrder
};
