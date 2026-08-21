const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const env = require('./config/env');
const { globalLimiter } = require('./middleware/rateLimiters');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const { NotFoundError } = require('./errors');

const app = express();

// Trust reverse proxy (Vercel, Render, Railway, Nginx, Cloudflare) - Fixes VULN-04
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false // Allow images to load across multi-tenant origins
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://multi-tenant-ecommerce-nine.vercel.app',
      env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
  })
);

// Global Rate Limiting on /api/
app.use('/api/', globalLimiter);

// Stripe Webhook Raw Body Middleware (Must precede json parser)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// General Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory serving with security headers
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  '/uploads',
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  })
);

// Mount API Routes
app.use('/api', apiRoutes);

// 404 Handler for unrecognized routes
app.use((req, res, next) => {
  next(new NotFoundError(`Endpoint '${req.method} ${req.originalUrl}' does not exist`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
