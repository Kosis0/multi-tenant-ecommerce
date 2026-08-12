const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://multi-tenant-ecommerce-nine.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
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

// POST /api/upload — Product Image Upload
app.post('/api/upload', resolveTenant, authenticateToken, requireStoreOwnership, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded');
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    sendSuccess(res, { url: imageUrl });
  } catch (err) {
    sendError(res, err.message);
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

    // Seed default categories
    const defaultCategories = [
      ['Phones', '📱'],
      ['Computers', '💻'],
      ['Smartwatch', '⌚'],
      ['Camera', '📷'],
      ['Headphones', '🎧'],
      ['Gaming', '🎮']
    ];
    for (const [catName, icon] of defaultCategories) {
      await client.query(
        'INSERT INTO categories (tenant_id, name, icon) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [tenant.id, catName, icon]
      );
    }

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

// GET /api/products — Enhanced with category, original_price, rating, etc.
app.get('/api/products', resolveTenant, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT id, title, price, stock, image_url, 
             COALESCE(category, 'General') as category, 
             description, original_price, 
             COALESCE(is_featured, false) as is_featured, 
             COALESCE(is_new_arrival, false) as is_new_arrival, 
             COALESCE(rating, 4.5) as rating, 
             COALESCE(review_count, 12) as review_count,
             COALESCE(discount_percent, 20) as discount_percent,
             COALESCE(flash_sale_units, stock) as flash_sale_units,
             COALESCE(images, '[]') as images
      FROM products 
      WHERE tenant_id = $1
    `;
    const queryParams = [req.tenant.id];

    if (category && category !== 'All') {
      queryParams.push(category);
      query += ` AND category = $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (title ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
    }

    query += ' ORDER BY created_at DESC, id DESC';

    const { rows: products } = await pool.query(query, queryParams);

    // Fetch categories for tenant
    const { rows: categories } = await pool.query(
      'SELECT id, name, icon FROM categories WHERE tenant_id = $1 ORDER BY name ASC',
      [req.tenant.id]
    );

    sendSuccess(res, { store: req.tenant, products, categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/products — Create product with expanded fields & image gallery
app.post('/api/products', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { 
    title, price, stock, image_url, 
    category = 'General', description = '', 
    original_price = null, is_featured = false, is_new_arrival = false,
    discount_percent = 20, flash_sale_units = null, images = []
  } = req.body;

  const imagesJson = typeof images === 'string' ? images : JSON.stringify(images);

  try {
    const { rows } = await pool.query(
      `INSERT INTO products (
        title, price, stock, image_url, tenant_id, 
        category, description, original_price, is_featured, is_new_arrival,
        discount_percent, flash_sale_units, images
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        title, price, stock, image_url, req.tenant.id, 
        category, description, original_price, is_featured, is_new_arrival,
        discount_percent, flash_sale_units || stock, imagesJson
      ]
    );
    sendSuccess(res, rows[0], 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id — Update product with expanded fields & image gallery
app.put('/api/products/:id', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { id } = req.params;
  const { 
    title, price, stock, image_url, 
    category, description, original_price, is_featured, is_new_arrival,
    discount_percent, flash_sale_units, images
  } = req.body;

  const imagesJson = images !== undefined ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;

  try {
    const { rows } = await pool.query(
      `UPDATE products 
       SET title = COALESCE($1, title), 
           price = COALESCE($2, price), 
           stock = COALESCE($3, stock), 
           image_url = COALESCE($4, image_url),
           category = COALESCE($5, category),
           description = COALESCE($6, description),
           original_price = COALESCE($7, original_price),
           is_featured = COALESCE($8, is_featured),
           is_new_arrival = COALESCE($9, is_new_arrival),
           discount_percent = COALESCE($10, discount_percent),
           flash_sale_units = COALESCE($11, flash_sale_units),
           images = COALESCE($12, images)
       WHERE id = $13 AND tenant_id = $14 
       RETURNING *`,
      [
        title, price, stock, image_url, category, description, 
        original_price, is_featured, is_new_arrival, discount_percent, 
        flash_sale_units, imagesJson, id, req.tenant.id
      ]
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

// GET /api/categories
app.get('/api/categories', resolveTenant, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories WHERE tenant_id = $1 ORDER BY name ASC', [req.tenant.id]);
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
app.post('/api/categories', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { name, icon = '📦' } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (tenant_id, name, icon) VALUES ($1, $2, $3) RETURNING *',
      [req.tenant.id, name, icon]
    );
    sendSuccess(res, rows[0], 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id — Update category name & icon
app.put('/api/categories/:id', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { id } = req.params;
  const { name, icon } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE categories 
       SET name = COALESCE($1, name), 
           icon = COALESCE($2, icon) 
       WHERE id = $3 AND tenant_id = $4 
       RETURNING *`,
      [name, icon, id, req.tenant.id]
    );
    if (rows.length === 0) return sendError(res, 'Category not found', 404);
    sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1 AND tenant_id = $2', [id, req.tenant.id]);
    sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// Wishlist Endpoints
app.get('/api/wishlist', resolveTenant, async (req, res, next) => {
  const { sessionId } = req.query;
  if (!sessionId) return sendSuccess(res, []);
  try {
    const { rows } = await pool.query(
      'SELECT product_id FROM wishlists WHERE tenant_id = $1 AND session_id = $2',
      [req.tenant.id, sessionId]
    );
    sendSuccess(res, rows.map(r => r.product_id));
  } catch (err) {
    next(err);
  }
});

app.post('/api/wishlist', resolveTenant, async (req, res, next) => {
  const { sessionId, productId } = req.body;
  if (!sessionId || !productId) return sendError(res, 'Session ID and Product ID required');
  try {
    await pool.query(
      'INSERT INTO wishlists (tenant_id, session_id, product_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.tenant.id, sessionId, productId]
    );
    sendSuccess(res, { added: true });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/wishlist/:productId', resolveTenant, async (req, res, next) => {
  const { productId } = req.params;
  const { sessionId } = req.query;
  try {
    await pool.query(
      'DELETE FROM wishlists WHERE tenant_id = $1 AND session_id = $2 AND product_id = $3',
      [req.tenant.id, sessionId, productId]
    );
    sendSuccess(res, { removed: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id/reviews — Fetch product reviews
app.get('/api/products/:id/reviews', resolveTenant, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, author_name, rating, comment, created_at FROM reviews WHERE tenant_id = $1 AND product_id = $2 ORDER BY created_at DESC',
      [req.tenant.id, id]
    );
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/reviews — Submit a customer review after purchase/view
app.post('/api/products/:id/reviews', resolveTenant, async (req, res, next) => {
  const { id } = req.params;
  const { authorName = 'Verified Buyer', rating = 5, comment } = req.body;

  if (!comment || !comment.trim()) {
    return sendError(res, 'Comment is required');
  }

  try {
    // Insert review
    const { rows: newReview } = await pool.query(
      'INSERT INTO reviews (tenant_id, product_id, author_name, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.tenant.id, id, authorName, Math.min(5, Math.max(1, Number(rating))), comment]
    );

    // Calculate new average rating & review count for product
    const { rows: stats } = await pool.query(
      'SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*)::int as total_reviews FROM reviews WHERE tenant_id = $1 AND product_id = $2',
      [req.tenant.id, id]
    );

    if (stats.length > 0) {
      await pool.query(
        'UPDATE products SET rating = $1, review_count = $2 WHERE id = $3 AND tenant_id = $4',
        [stats[0].avg_rating || 5, stats[0].total_reviews || 1, id, req.tenant.id]
      );
    }

    sendSuccess(res, newReview[0], 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders — Create order (atomic transaction)
app.post('/api/orders', resolveTenant, async (req, res, next) => {
  const { items, paymentMethod = 'card' } = req.body;
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
      "INSERT INTO orders (tenant_id, total_amount, status, created_at) VALUES ($1, $2, 'pending', NOW()) RETURNING *",
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
    
    const { rows: orderItems } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    sendSuccess(res, { ...order, items: orderItems }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    sendError(res, err.message);
  } finally {
    client.release();
  }
});

// POST /api/checkout/create-session — Stripe / Payment Scaffolding (Supports NGN Naira)
app.post('/api/checkout/create-session', resolveTenant, async (req, res, next) => {
  const { items } = req.body;
  if (!items || items.length === 0) return sendError(res, 'Items required');

  try {
    let stripeSecret = process.env.STRIPE_SECRET_KEY;
    
    // If Stripe secret key exists, create actual Stripe Session
    if (stripeSecret) {
      const stripe = require('stripe')(stripeSecret);
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'ngn', // Naira
          product_data: {
            name: item.title,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100), // In kobo / cents
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.get('origin') || 'http://localhost:3000'}/${req.tenant.slug}?checkout=success`,
        cancel_url: `${req.get('origin') || 'http://localhost:3000'}/${req.tenant.slug}?checkout=cancel`,
      });

      return sendSuccess(res, { url: session.url, isMock: false });
    }

    // Mock payment gateway response for testing without active Stripe API keys
    const mockSessionId = 'cs_test_' + Date.now();
    sendSuccess(res, {
      url: null,
      isMock: true,
      sessionId: mockSessionId,
      message: 'Stripe Gateway Scaffolding active. Add STRIPE_SECRET_KEY in .env to process real cards.'
    });
  } catch (err) {
    next(err);
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
      ORDER BY o.created_at DESC
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
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});