const { stripe, webhookSecret, isConfigured: isStripeConfigured } = require('../config/stripe');
const { withTransaction } = require('../config/db');
const { BadRequestError } = require('../errors');
const { ORDER_STATUS } = require('../constants/orderStatus');

/**
 * Idempotently processes Stripe Webhook events inside a database transaction.
 */
const handleStripeWebhook = async (rawBody, signature) => {
  let event;

  if (isStripeConfigured && stripe && webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestError(`Webhook signature verification failed: ${err.message}`);
    }
  } else {
    // If webhook secret is not configured in dev, parse raw JSON body
    try {
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch (err) {
      throw new BadRequestError('Invalid webhook payload');
    }
  }

  if (!event || !event.id) {
    throw new BadRequestError('Malformed webhook event object');
  }

  return withTransaction(async (client) => {
    // 1. Idempotency Check: Guard against duplicate event deliveries
    const existing = await client.query('SELECT 1 FROM webhook_events WHERE id = $1', [event.id]);
    if (existing.rows.length > 0) {
      return { duplicate: true, eventId: event.id };
    }

    const session = event.data?.object;
    const orderId = session?.metadata?.orderId;
    const tenantId = session?.metadata?.tenantId;

    if (event.type === 'checkout.session.completed') {
      if (orderId) {
        await client.query(
          `UPDATE orders 
           SET status = $1, stripe_payment_id = $2 
           WHERE id = $3 ${tenantId ? 'AND tenant_id = $4' : ''}`,
          tenantId
            ? [ORDER_STATUS.PAID, session.payment_intent || session.id, orderId, tenantId]
            : [ORDER_STATUS.PAID, session.payment_intent || session.id, orderId]
        );
      }
    } else if (event.type === 'checkout.session.expired') {
      if (orderId) {
        // Release reserved stock back to catalog
        const itemsRes = await client.query(
          'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = $1',
          [orderId]
        );

        for (const item of itemsRes.rows) {
          if (item.variant_id) {
            await client.query(
              'UPDATE product_variants SET stock = stock + $1 WHERE id = $2',
              [item.quantity, item.variant_id]
            );
          } else if (item.product_id) {
            await client.query(
              `UPDATE products SET stock = stock + $1 WHERE id = $2 ${tenantId ? 'AND tenant_id = $3' : ''}`,
              tenantId ? [item.quantity, item.product_id, tenantId] : [item.quantity, item.product_id]
            );
          }
        }

        await client.query(
          `UPDATE orders SET status = $1 WHERE id = $2 ${tenantId ? 'AND tenant_id = $3' : ''}`,
          tenantId ? [ORDER_STATUS.CANCELLED, orderId, tenantId] : [ORDER_STATUS.CANCELLED, orderId]
        );
      }
    }

    // 2. Record processed webhook event
    await client.query(
      'INSERT INTO webhook_events (id, type, tenant_id, payload) VALUES ($1, $2, $3, $4)',
      [event.id, event.type, tenantId || null, event]
    );

    return { success: true, eventId: event.id };
  });
};

module.exports = {
  handleStripeWebhook
};
