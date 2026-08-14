# Mercato — Multi-Tenant E-Commerce Platform

A production-grade, multi-tenant e-commerce platform built with Next.js (App Router, Tailwind CSS v4), Express.js, and PostgreSQL (Supabase).

Provides dynamic tenant routing (`/[tenant]`), tenant boundary isolation, merchant onboarding, custom store category management, live flash sales countdowns, customer product reviews, product detail gallery modals, wishlist, slide-out cart drawers, Naira (₦) currency formatting, and a store owner dashboard with analytics.

---

## 🌟 Key Features

### 🛒 Customer Storefront (`/[tenant]`)
- **Responsive Mobile Drawer**: Slide-in navigation drawer with line-art category icons, search bar, and quick navigation links.
- **Real-Time Search & Smooth Scroll**: Instant keyword search filtering by product title or category with smooth viewport auto-scrolling on submit.
- **Product Detail Modal**: High-res image gallery with interactive thumbnail switching, stock status, strikethrough prices, Naira (`₦`) formatting, and rich item overview specs.
- **Customer Reviews & Ratings**: View reviews and submit verified customer feedback with 1–5 star ratings. Submissions automatically recalculate the product's average rating and total review count.
- **Flash Sales & Live Countdown**: Live ticking countdown timer (Days, Hours, Mins, Secs) featuring discounted products with calculated or custom `-X% OFF` badges and allocated sale units.
- **Category Browsing & Filtering**: Filter storefront products by custom store categories or built-in preset categories.
- **Wishlist & Cart Drawers**: Heart wishlist animations, slide-out cart drawer with stock-limit validation, quantity adjustments (`-`/`+`), and Stripe NGN checkout.
- **Customer Accounts**: JWT-based customer login/register with a secure profile area to view personal order history and track order status.

### 🏪 Store Owner Admin Portal (`/[tenant]/admin`)
- **Category Management (Category CRUD)**: Create custom categories with custom icons/emojis, edit category names/icons, and delete unused categories.
- **Product Catalog Management (Product CRUD)**: Add, edit, and delete products. Assign items to categories, upload main image files or enter URLs, manage extra gallery images, and toggle `is_new_arrival` badges.
- **Product Variants**: Full support for variants (e.g., sizes, colors). Merchants can add custom variants directly from the dashboard, each with dedicated stock levels and price adjustments.
- **Flash Sale Controls**: Toggle Flash Sale status per item, set custom discount percentage (`% OFF`), and allocate flash sale unit quantities.
- **Advanced Order Analytics**: Visual Recharts dashboards tracking 7-day revenue trends, total order counts, top-performing products, and critical low-stock alerts.
- **Order Processing & Email Notifications**: Process orders (`pending`, `paid`, `shipped`, `delivered`, `cancelled`). Automatically triggers `nodemailer` HTML emails to customers upon order confirmation and shipping dispatch.
- **Merchant Onboarding & Auth**: Secure store registration (`/register-store`) with custom owner passwords and tenant JWT authentication.

### 🎨 Clean Professional Design System
- **Dark Theme Aesthetics**: Deep dark background (`#09090b`), surface cards (`#141418`), crisp borders (`#272734`), crimson accents (`#db4444`), and vector SVG line-art icons.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Node.js, Express.js 5
- **Database**: PostgreSQL (Supabase) via `pg` connection pool
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` password hashing
- **Payments**: Stripe NGN Checkout integration
- **Media**: Cloudinary CDN for optimized image storage and delivery

---

## 📁 Repository Structure

```
├── client/                     # Next.js 16 App Router Frontend
│   ├── app/
│   │   ├── page.js             # Platform Landing Page
│   │   ├── register-store/     # Store Registration Form
│   │   └── [tenant]/           # Dynamic Tenant Routing
│   │       ├── page.jsx        # Public Customer Storefront
│   │       └── admin/          # Store Owner Admin Portal
│   ├── app/globals.css         # Styling Tokens & Theme System
│   └── app/layout.js           # Root Layout & Inter Typography
├── db.js                       # PostgreSQL Pool Setup (Supabase SSL)
├── server.js                   # Express.js REST API Server (23 Endpoints)
├── supabase-migration.sql      # V1 Database Migration Script
├── supabase-migration-v2.sql   # V2 Enhanced Database Migration Script
├── supabase-migration-v3.sql   # V3 Product Variants Database Migration Script
└── supabase-migration-v4.sql   # V4 Customer Accounts Database Migration Script
```

---

## 🚀 Getting Started

### 1. Database Setup (Supabase)
Execute the migration scripts in your **Supabase SQL Editor** in order:
1. [`supabase-migration.sql`](./supabase-migration.sql)
2. [`supabase-migration-v2.sql`](./supabase-migration-v2.sql)
3. [`supabase-migration-v3.sql`](./supabase-migration-v3.sql)
4. [`supabase-migration-v4.sql`](./supabase-migration-v4.sql)

This creates:
- `tenants`, `users`, `products`, `product_variants`, `categories`, `reviews`, `wishlists`, `orders`, and `order_items` tables.
- Performance indexes on `tenant_id`, `category`, and `session_id`.
- Foreign key constraints with `ON DELETE CASCADE`.

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/postgres
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=no-reply@yourstore.com
```

### 3. Install & Run Locally

#### Backend Server:
```bash
npm install
node server.js
```
The server starts on `http://localhost:5000`.

#### Frontend Application:
```bash
cd client
npm install
npm run dev
```
The frontend starts on `http://localhost:3000`.

---

## 🔗 Route Map & URLs

| Page | URL Path | Description |
|---|---|---|
| **Platform Landing** | `http://localhost:3000/` | Platform landing page |
| **Launch Store** | `http://localhost:3000/register-store` | Register store & owner password |
| **Customer Storefront** | `http://localhost:3000/[slug]` | Public shopping page |
| **Store Admin Portal** | `http://localhost:3000/[slug]/admin` | Merchant management dashboard |

---

## 📡 API Endpoints Summary

### Auth & Tenant Management
- `POST /api/tenants/register` — Register tenant & owner password
- `POST /api/auth/login` — Store owner authentication

### Categories API
- `GET /api/categories?tenant={slug}` — Fetch store categories
- `POST /api/categories?tenant={slug}` — Create custom category *(Protected)*
- `PUT /api/categories/:id?tenant={slug}` — Edit category name/icon *(Protected)*
- `DELETE /api/categories/:id?tenant={slug}` — Delete category *(Protected)*

### Products & Reviews API
- `GET /api/products?tenant={slug}` — Fetch storefront products
- `POST /api/products?tenant={slug}` — Create product with images & flash sale fields *(Protected)*
- `PUT /api/products/:id?tenant={slug}` — Update product *(Protected)*
- `DELETE /api/products/:id?tenant={slug}` — Delete product *(Protected)*
- `GET /api/products/:id/reviews?tenant={slug}` — Fetch product reviews
- `POST /api/products/:id/reviews?tenant={slug}` — Submit customer review & update rating

### Orders & Checkout API
- `POST /api/orders?tenant={slug}` — Create customer order with stock check (Triggers confirmation email)
- `POST /api/checkout/create-session?tenant={slug}` — Create Stripe NGN checkout session
- `GET /api/orders?tenant={slug}` — Fetch store orders *(Protected)*
- `PATCH /api/orders/:id?tenant={slug}` — Update order status (Triggers shipping email) *(Protected)*
- `GET /api/admin/stats?tenant={slug}` — Store revenue, charts, & top products *(Protected)*

### Customer Accounts API
- `POST /api/customers/register` — Register a customer account
- `POST /api/customers/login` — Login a customer
- `GET /api/customers/orders` — Fetch a customer's personal order history *(Customer Protected)*

---

## 🌐 Production Deployment

- **Database**: Supabase PostgreSQL (Cloud)
- **Backend**: Render / Railway (`node server.js`)
- **Frontend**: Vercel (Root directory: `client`)

- **Database**: Supabase PostgreSQL (Cloud)
- **Backend**: Render / Railway (`node server.js`)
- **Frontend**: Vercel (Root directory: `client`)
