const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
const sendError = (res, error, status = 400) => res.status(status).json({ success: false, error });

// Middleware
const resolveTenant = async (req, res, next) => {
  const slug = req.headers['x-tenant-slug'] || req.query.tenant;
  if (!slug) return sendError(res, 'Tenant slug required');

  try {
    const { rows } = await pool.query('SELECT * FROM tenants WHERE slug = $1', [slug]);
    if (rows.length === 0) return sendError(res, 'Tenant not found', 404);
    req.tenant = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return sendError(res, 'Access denied', 401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return sendError(res, 'Invalid token', 403);
    req.user = user;
    next();
  });
};

const requireStoreOwnership = (req, res, next) => {
  if (!req.user || !req.tenant || req.user.tenantId !== req.tenant.id) {
    return sendError(res, 'Unauthorized for this store', 403);
  }
  next();
};

// Endpoints

// GET /api/health
app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    sendSuccess(res, { status: 'healthy' });
  } catch (err) {
    next(err);
  }
});

// POST /api/tenants/register
app.post('/api/tenants/register', async (req, res, next) => {
  const { name, slug, email, password } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check slug
    const slugCheck = await client.query('SELECT 1 FROM tenants WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) throw new Error('Slug already exists');

    // Check email
    const emailCheck = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) throw new Error('Email already exists');

    const tenantRes = await client.query(
      'INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING *',
      [name, slug]
    );
    const tenant = tenantRes.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      "INSERT INTO users (email, password_hash, tenant_id, role) VALUES ($1, $2, $3, 'owner') RETURNING id, email, role, tenant_id",
      [email, passwordHash, tenant.id]
    );
    const user = userRes.rows[0];

    await client.query('COMMIT');
    sendSuccess(res, { tenant, user }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    sendError(res, err.message);
  } finally {
    client.release();
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(`
      SELECT u.*, t.slug AS tenant_slug 
      FROM users u 
      JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.email = $1
    `, [email]);
    
    if (rows.length === 0) return sendError(res, 'Invalid credentials', 401);
    
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return sendError(res, 'Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    sendSuccess(res, { token, tenantSlug: user.tenant_slug });
  } catch (err) {
    next(err);
  }
});

// GET /api/products
app.get('/api/products', resolveTenant, async (req, res, next) => {
  try {
    const { rows: products } = await pool.query(
      'SELECT id, title, price, stock, image_url FROM products WHERE tenant_id = $1',
      [req.tenant.id]
    );
    sendSuccess(res, { store: req.tenant, products });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
app.post('/api/products', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { title, price, stock, image_url } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO products (title, price, stock, image_url, tenant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, price, stock, image_url, req.tenant.id]
    );
    sendSuccess(res, rows[0], 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { id } = req.params;
  const { title, price, stock, image_url } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products 
       SET title = COALESCE($1, title), 
           price = COALESCE($2, price), 
           stock = COALESCE($3, stock), 
           image_url = COALESCE($4, image_url) 
       WHERE id = $5 AND tenant_id = $6 
       RETURNING *`,
      [title, price, stock, image_url, id, req.tenant.id]
    );
    if (rows.length === 0) return sendError(res, 'Product not found', 404);
    sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM products WHERE id = $1 AND tenant_id = $2',
      [id, req.tenant.id]
    );
    if (rowCount === 0) return sendError(res, 'Product not found', 404);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
app.post('/api/orders', resolveTenant, async (req, res, next) => {
  const { items } = req.body;
  if (!items || items.length === 0) return sendError(res, 'Items required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let total_amount = 0;
    
    for (const item of items) {
      const prodRes = await client.query(
        'SELECT price, stock FROM products WHERE id = $1 AND tenant_id = $2',
        [item.product_id, req.tenant.id]
      );
      if (prodRes.rows.length === 0) throw new Error(`Product ${item.product_id} not found in this store`);
      
      const product = prodRes.rows[0];
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);
      
      total_amount += product.price * item.quantity;
      
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    const orderRes = await client.query(
      "INSERT INTO orders (tenant_id, total_amount, status) VALUES ($1, $2, 'pending') RETURNING *",
      [req.tenant.id, total_amount]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      const prodRes = await client.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
      const unit_price = prodRes.rows[0].price;
      
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, unit_price]
      );
    }

    await client.query('COMMIT');
    
    // Fetch inserted items for response
    const { rows: orderItems } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    sendSuccess(res, { ...order, items: orderItems }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    sendError(res, err.message);
  } finally {
    client.release();
  }
});

// GET /api/orders
app.get('/api/orders', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, 
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
    `, [req.tenant.id]);
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id
app.patch('/api/orders/:id', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) return sendError(res, 'Invalid status');
  
  try {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
      [status, id, req.tenant.id]
    );
    if (rows.length === 0) return sendError(res, 'Order not found', 404);
    sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/pay
app.post('/api/orders/:id/pay', resolveTenant, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND tenant_id = $2',
      [id, req.tenant.id]
    );
    if (orders.length === 0) return sendError(res, 'Order not found', 404);
    
    if (orders[0].status !== 'pending') return sendError(res, 'Order is not pending');
    
    const { rows } = await pool.query(
      "UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *",
      [id]
    );
    sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  try {
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE tenant_id = $1 AND status IN ('paid', 'shipped', 'delivered')",
      [req.tenant.id]
    );
    const orderCountRes = await pool.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [req.tenant.id]);
    const productCountRes = await pool.query('SELECT COUNT(*) FROM products WHERE tenant_id = $1', [req.tenant.id]);
    const recentRes = await pool.query(
      'SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 5',
      [req.tenant.id]
    );
    
    sendSuccess(res, {
      revenue: parseFloat(revenueRes.rows[0].revenue),
      totalOrders: parseInt(orderCountRes.rows[0].count),
      totalProducts: parseInt(productCountRes.rows[0].count),
      recentOrders: recentRes.rows
    });
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});