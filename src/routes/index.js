const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const customerRoutes = require('./customer.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const checkoutRoutes = require('./checkout.routes');
const webhookRoutes = require('./webhook.routes');
const reviewRoutes = require('./review.routes');
const wishlistRoutes = require('./wishlist.routes');
const analyticsRoutes = require('./analytics.routes');
const tenantRoutes = require('./tenant.routes');
const uploadRoutes = require('./upload.routes');

// Health Check
router.use('/health', healthRoutes);

// Auth & Tenant Onboarding (/api/tenants/register, /api/auth/login)
router.use('/', authRoutes);

// Customer Auth & Orders (/api/customers/register, /api/customers/login, /api/customers/orders)
router.use('/customers', customerRoutes);

// Products & Reviews (/api/products, /api/products/:id/reviews)
router.use('/products', reviewRoutes);
router.use('/products', productRoutes);

// Categories (/api/categories)
router.use('/categories', categoryRoutes);

// Orders (/api/orders)
router.use('/orders', orderRoutes);

// Checkout (/api/checkout/create-session)
router.use('/checkout', checkoutRoutes);

// Stripe Webhooks (/api/webhooks/stripe)
router.use('/webhooks', webhookRoutes);

// Wishlists (/api/wishlist)
router.use('/wishlist', wishlistRoutes);

// Admin Analytics (/api/admin/stats)
router.use('/admin', analyticsRoutes);

// Tenant Settings (/api/tenant/settings)
router.use('/tenant', tenantRoutes);

// Uploads (/api/upload)
router.use('/upload', uploadRoutes);

module.exports = router;
