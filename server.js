const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { z } = require('zod');
require('dotenv').config();

// Environment Validation
if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not defined in environment.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// --- Email Configuration ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
      console.log('Mock Email sent to:', to);
      console.log('Subject:', subject);
      return { success: true, message: 'Mock email sent (configure SMTP to send real emails)' };
    }
    const info = await transporter.sendMail({
      from: `"Mercato Platform" <${process.env.SMTP_FROM || 'no-reply@mercato.com'}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err.message };
  }
};
// ----------------------------

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false, // allow images to be loaded
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

// Specific Auth Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login/register requests per windowMs
  message: { success: false, error: 'Too many login attempts, please try again later.' }
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage — uses memory buffer when Cloudinary is configured, disk otherwise
const useCloudinary = !!process.env.CLOUDINARY_URL;

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: useCloudinary ? multer.memoryStorage() : diskStorage,
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

// Validation Middleware
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, 400);
    }
    next(error);
  }
};

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  slug: z.string().min(2, "Store slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  tenantSlug: z.string().optional()
});

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be a positive number").or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  stock: z.number().min(0, "Stock cannot be negative").or(z.string().regex(/^\d+$/).transform(Number)),
  image_url: z.string().url("Valid image URL is required").optional().nullable().or(z.literal("")),
  category: z.string().optional(),
  description: z.string().optional(),
  original_price: z.number().nullable().optional().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number).nullable().optional()),
  is_featured: z.boolean().optional(),
  is_new_arrival: z.boolean().optional(),
  discount_percent: z.number().min(0).max(100).optional().or(z.string().regex(/^\d+$/).transform(Number).optional()),
  flash_sale_units: z.number().min(0).optional().nullable().or(z.string().regex(/^\d+$/).transform(Number).nullable().optional()),
  images: z.any().optional(),
  variants: z.array(z.object({
    name: z.string(),
    value: z.string(),
    stock: z.number().or(z.string().transform(Number)).optional().default(0),
    price_adjustment: z.number().or(z.string().transform(Number)).optional().default(0)
  })).optional()
});

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

// POST /api/upload — Product Image Upload (Bug Fix #5: Cloudinary for persistent cloud storage)
app.post('/api/upload', resolveTenant, authenticateToken, requireStoreOwnership, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded');
    }

    // If Cloudinary is configured, upload to cloud (images survive Render redeploys)
    if (useCloudinary) {
      const { v2: cloudinary } = require('cloudinary');
      // CLOUDINARY_URL env var auto-configures cloud_name, api_key, api_secret
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `stores/${req.tenant.slug}`, resource_type: 'image' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        uploadStream.end(req.file.buffer);
      });
      return sendSuccess(res, { url: result.secure_url });
    }

    // Fallback: local disk storage (for development only)
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    sendSuccess(res, { url: imageUrl });
  } catch (err) {
    sendError(res, err.message);
  }
});

// POST /api/tenants/register
app.post('/api/tenants/register', authLimiter, validate(registerSchema), async (req, res, next) => {
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
app.post('/api/auth/login', authLimiter, validate(loginSchema), async (req, res, next) => {
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

// POST /api/customers/register
app.post('/api/customers/register', resolveTenant, async (req, res, next) => {
  try {
    const { email, password, name, phone, address } = req.body;
    if (!email || !password) return sendError(res, 'Email and password required', 400);

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO customers (tenant_id, email, password_hash, name, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name',
      [req.tenant.id, email.toLowerCase(), hash, name, phone, address]
    );

    const customer = rows[0];
    const token = jwt.sign(
      { customerId: customer.id, tenantId: req.tenant.id, role: 'customer' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    sendSuccess(res, { token, customer }, 201);
  } catch (err) {
    if (err.code === '23505') return sendError(res, 'Email already registered in this store', 400);
    next(err);
  }
});

// POST /api/customers/login
app.post('/api/customers/login', resolveTenant, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password required', 400);

    const { rows } = await pool.query('SELECT * FROM customers WHERE tenant_id = $1 AND email = $2', [req.tenant.id, email.toLowerCase()]);
    if (rows.length === 0) return sendError(res, 'Invalid credentials', 401);

    const customer = rows[0];
    const match = await bcrypt.compare(password, customer.password_hash);
    if (!match) return sendError(res, 'Invalid credentials', 401);

    const token = jwt.sign(
      { customerId: customer.id, tenantId: customer.tenant_id, role: 'customer' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    delete customer.password_hash;
    sendSuccess(res, { token, customer });
  } catch (err) {
    next(err);
  }
});

// Middleware to authenticate customer token
const authenticateCustomerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return sendError(res, 'Unauthorized', 401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return sendError(res, 'Forbidden', 403);
    if (user.role !== 'customer' || user.tenantId !== req.tenant.id) return sendError(res, 'Forbidden', 403);
    req.customer = user;
    next();
  });
};

// Middleware to optionally authenticate customer token
const optionalAuthenticateCustomerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (!err && user.role === 'customer' && user.tenantId === req.tenant.id) {
      req.customer = user;
    }
    next();
  });
};

// GET /api/customers/orders
app.get('/api/customers/orders', resolveTenant, authenticateCustomerToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, 
             COALESCE(json_agg(json_build_object(
               'id', oi.id, 
               'product_id', oi.product_id, 
               'quantity', oi.quantity, 
               'unit_price', oi.unit_price,
               'variant_info', oi.variant_info
             )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.tenant_id = $1 AND o.customer_id = $2
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.tenant.id, req.customer.customerId]);

    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/products — Enhanced with category, original_price, rating, etc.
app.get('/api/products', resolveTenant, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let query = `
      SELECT products.id, products.title, products.price, products.stock, products.image_url, 
             COALESCE(products.category, 'General') as category, 
             products.description, products.original_price, 
             COALESCE(products.is_featured, false) as is_featured, 
             COALESCE(products.is_new_arrival, false) as is_new_arrival, 
             COALESCE(products.rating, 4.5) as rating, 
             COALESCE(products.review_count, 12) as review_count,
             COALESCE(products.discount_percent, 20) as discount_percent,
             COALESCE(products.flash_sale_units, products.stock) as flash_sale_units,
             COALESCE(products.images, '[]') as images,
             (SELECT COALESCE(json_agg(json_build_object(
                 'id', pv.id, 'name', pv.name, 'value', pv.value, 
                 'stock', pv.stock, 'price_adjustment', pv.price_adjustment
              )), '[]'::json) FROM product_variants pv WHERE pv.product_id = products.id) as variants
      FROM products 
      WHERE products.tenant_id = $1
    `;
    let countQuery = `SELECT COUNT(*) FROM products WHERE tenant_id = $1`;
    const queryParams = [req.tenant.id];

    if (category && category !== 'All') {
      queryParams.push(category);
      query += ` AND category = $${queryParams.length}`;
      countQuery += ` AND category = $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (title ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
      countQuery += ` AND (title ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
    }

    query += ` ORDER BY created_at DESC, id DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    const countRes = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const { rows: products } = await pool.query(query, [...queryParams, limit, offset]);

    // Fetch categories for tenant
    const { rows: categories } = await pool.query(
      'SELECT id, name, icon FROM categories WHERE tenant_id = $1 ORDER BY name ASC',
      [req.tenant.id]
    );

    sendSuccess(res, { 
      store: {
        ...req.tenant,
        show_flash_deals: req.tenant.show_flash_deals !== false,
        hero_product_id: req.tenant.hero_product_id || null,
        hero_badge: req.tenant.hero_badge || null,
        hero_title: req.tenant.hero_title || null,
        hero_subtitle: req.tenant.hero_subtitle || null
      }, 
      products, 
      categories,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/products — Create product with expanded fields & image gallery & variants
app.post('/api/products', resolveTenant, authenticateToken, requireStoreOwnership, validate(productSchema), async (req, res, next) => {
  const { 
    title, price, stock, image_url, 
    category = 'General', description = '', 
    original_price = null, is_featured = false, is_new_arrival = false,
    discount_percent = 20, flash_sale_units = null, images = [], variants = []
  } = req.body;

  const imagesJson = typeof images === 'string' ? images : JSON.stringify(images);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
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
    const newProduct = rows[0];

    if (variants && variants.length > 0) {
      for (const v of variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, name, value, stock, price_adjustment) VALUES ($1, $2, $3, $4, $5)`,
          [newProduct.id, v.name, v.value, v.stock || 0, v.price_adjustment || 0]
        );
      }
    }

    await client.query('COMMIT');
    
    // Fetch attached variants
    const vRows = await pool.query('SELECT id, name, value, stock, price_adjustment FROM product_variants WHERE product_id = $1', [newProduct.id]);
    newProduct.variants = vRows.rows;

    sendSuccess(res, newProduct, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PUT /api/products/:id — Update product with expanded fields & image gallery & variants
app.put('/api/products/:id', resolveTenant, authenticateToken, requireStoreOwnership, validate(productSchema), async (req, res, next) => {
  const { id } = req.params;
  const { 
    title, price, stock, image_url, 
    category, description, original_price, is_featured, is_new_arrival,
    discount_percent, flash_sale_units, images, variants
  } = req.body;

  const imagesJson = images !== undefined ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
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
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Product not found', 404);
    }
    const updatedProduct = rows[0];

    if (variants !== undefined) {
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [updatedProduct.id]);
      if (variants.length > 0) {
        for (const v of variants) {
          await client.query(
            `INSERT INTO product_variants (product_id, name, value, stock, price_adjustment) VALUES ($1, $2, $3, $4, $5)`,
            [updatedProduct.id, v.name, v.value, v.stock || 0, v.price_adjustment || 0]
          );
        }
      }
    }

    await client.query('COMMIT');

    const vRows = await pool.query('SELECT id, name, value, stock, price_adjustment FROM product_variants WHERE product_id = $1', [updatedProduct.id]);
    updatedProduct.variants = vRows.rows;

    sendSuccess(res, updatedProduct);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
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
    const result = await pool.query('DELETE FROM categories WHERE id = $1 AND tenant_id = $2', [id, req.tenant.id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Category not found' });
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
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1 AND tenant_id = $2', [req.params.id, req.tenant.id]);
    if (productCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });

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
app.post('/api/orders', resolveTenant, optionalAuthenticateCustomerToken, async (req, res, next) => {
  const { items, paymentMethod = 'card', email } = req.body;
  if (!items || items.length === 0) return sendError(res, 'Items required');

  const customerEmail = req.customer ? req.customer.email : email;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let total_amount = 0;
    
    for (const item of items) {
      const prodRes = await client.query(
        'SELECT price, stock, title FROM products WHERE id = $1 AND tenant_id = $2',
        [item.product_id, req.tenant.id]
      );
      if (prodRes.rows.length === 0) throw new Error(`Product ${item.product_id} not found in this store`);
      
      const product = prodRes.rows[0];
      let unit_price = Number(product.price);
      
      if (item.variant_id) {
        const variantRes = await client.query(
          'SELECT stock, price_adjustment, name, value FROM product_variants WHERE id = $1 AND product_id = $2',
          [item.variant_id, item.product_id]
        );
        if (variantRes.rows.length === 0) throw new Error(`Variant ${item.variant_id} not found`);
        
        const variant = variantRes.rows[0];
        if (variant.stock < item.quantity) throw new Error(`Insufficient stock for variant ${variant.name} ${variant.value}`);
        
        unit_price += Number(variant.price_adjustment);
        
        await client.query(
          'UPDATE product_variants SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.variant_id]
        );
      } else {
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.title}`);
        
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2 AND tenant_id = $3',
          [item.quantity, item.product_id, req.tenant.id]
        );
      }
      
      total_amount += unit_price * item.quantity;
      item.calculated_unit_price = unit_price;
    }

    const orderRes = await client.query(
      "INSERT INTO orders (tenant_id, total_amount, status, created_at, customer_id, customer_email) VALUES ($1, $2, 'pending', NOW(), $3, $4) RETURNING *",
      [req.tenant.id, total_amount, req.customer ? req.customer.customerId : null, customerEmail]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, variant_info) VALUES ($1, $2, $3, $4, $5)',
        [order.id, item.product_id, item.quantity, item.calculated_unit_price, item.variant_info ? JSON.stringify(item.variant_info) : null]
      );
    }

    await client.query('COMMIT');
    
    const { rows: orderItems } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    
    // --- Send Email Notification ---
    if (customerEmail) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Thank you for your order!</h2>
          <p>We've received your order <strong>#${order.id.slice(0,8).toUpperCase()}</strong> and are processing it.</p>
          <p><strong>Total Amount:</strong> ₦${Number(total_amount).toLocaleString()}</p>
          <h3>Order Items:</h3>
          <ul>
            ${items.map(item => `<li>Product #${item.product_id} (x${item.quantity}) - ₦${Number(item.calculated_unit_price).toLocaleString()}</li>`).join('')}
          </ul>
          <p>You can check the status of your order by logging into your account.</p>
        </div>
      `;
      sendEmail(customerEmail, `Order Confirmation #${order.id.slice(0,8).toUpperCase()}`, emailHtml);
    }
    // --------------------------------
    
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countRes = await pool.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [req.tenant.id]);
    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

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
      LIMIT $2 OFFSET $3
    `, [req.tenant.id, limit, offset]);

    sendSuccess(res, {
      orders: rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
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
    
    const order = rows[0];
    
    if (order.customer_email && (status === 'shipped' || status === 'delivered')) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Your order has been ${status}!</h2>
          <p>Great news! Your order <strong>#${order.id.slice(0,8).toUpperCase()}</strong> is now marked as <strong>${status}</strong>.</p>
          <p>You can check the detailed status of your order by logging into your account.</p>
        </div>
      `;
      sendEmail(order.customer_email, `Order ${status.toUpperCase()} #${order.id.slice(0,8).toUpperCase()}`, emailHtml);
    }
    
    sendSuccess(res, order);
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
      "UPDATE orders SET status = 'paid' WHERE id = $1 AND tenant_id = $2 RETURNING *",
      [id, req.tenant.id]
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
    
    // Revenue over last 7 days
    const dailyRevenueRes = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue
      FROM orders
      WHERE tenant_id = $1 AND status IN ('paid', 'shipped', 'delivered')
      AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `, [req.tenant.id]);
    
    // Top 5 Products by Quantity Sold
    const topProductsRes = await pool.query(`
      SELECT p.id, p.title, SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.tenant_id = $1 AND o.status IN ('paid', 'shipped', 'delivered')
      GROUP BY p.id, p.title
      ORDER BY total_sold DESC
      LIMIT 5
    `, [req.tenant.id]);
    
    // Low Stock Alert
    const lowStockRes = await pool.query(`
      SELECT id, title, stock FROM products 
      WHERE tenant_id = $1 AND stock <= 5 
      ORDER BY stock ASC LIMIT 5
    `, [req.tenant.id]);
    
    sendSuccess(res, {
      revenue: parseFloat(revenueRes.rows[0].revenue),
      totalOrders: parseInt(orderCountRes.rows[0].count),
      totalProducts: parseInt(productCountRes.rows[0].count),
      recentOrders: recentRes.rows,
      chartData: dailyRevenueRes.rows,
      topProducts: topProductsRes.rows,
      lowStock: lowStockRes.rows,
      storeSettings: {
        show_flash_deals: req.tenant.show_flash_deals !== false,
        hero_product_id: req.tenant.hero_product_id || null,
        hero_badge: req.tenant.hero_badge || null,
        hero_title: req.tenant.hero_title || null,
        hero_subtitle: req.tenant.hero_subtitle || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tenant/settings — Update store settings (Flash Deals toggle, Hero Showcase Product)
app.put('/api/tenant/settings', resolveTenant, authenticateToken, requireStoreOwnership, async (req, res, next) => {
  try {
    const { show_flash_deals, hero_product_id, hero_badge, hero_title, hero_subtitle } = req.body;
    
    // Auto-create any missing columns in tenants table
    try {
      await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS show_flash_deals BOOLEAN DEFAULT TRUE');
      await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_product_id INTEGER');
      await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_badge VARCHAR(255)');
      await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255)');
      await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_subtitle TEXT');
    } catch (colErr) {
      // Ignore migration errors if already exists
    }

    try {
      await pool.query(
        `UPDATE tenants 
         SET show_flash_deals = COALESCE($1, show_flash_deals),
             hero_product_id = $2,
             hero_badge = COALESCE($3, hero_badge),
             hero_title = COALESCE($4, hero_title),
             hero_subtitle = COALESCE($5, hero_subtitle)
         WHERE id = $6`,
        [
          show_flash_deals !== undefined ? show_flash_deals === true : null,
          hero_product_id !== undefined ? (hero_product_id ? parseInt(hero_product_id) : null) : req.tenant.hero_product_id,
          hero_badge !== undefined ? hero_badge : null,
          hero_title !== undefined ? hero_title : null,
          hero_subtitle !== undefined ? hero_subtitle : null,
          req.tenant.id
        ]
      );
    } catch (updateErr) {
      console.warn('Could not persist all settings to tenants table:', updateErr.message);
    }

    sendSuccess(res, { 
      show_flash_deals: show_flash_deals !== undefined ? show_flash_deals === true : req.tenant.show_flash_deals,
      hero_product_id: hero_product_id !== undefined ? hero_product_id : req.tenant.hero_product_id,
      hero_badge,
      hero_title,
      hero_subtitle
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