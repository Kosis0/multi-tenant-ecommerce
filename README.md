# Mercato — Multi-Tenant E-Commerce Platform

A production-grade, multi-tenant e-commerce platform built with Next.js (App Router, Tailwind CSS v4), Express.js, and PostgreSQL (Supabase).

Features dynamic tenant routing (`/[tenant]`), tenant boundary isolation, JWT authentication, real-time inventory management, stock validation, slide-out checkout drawer, and a store owner dashboard with analytics.

---

## 🌟 Key Features

- **Multi-Tenant Isolation**: Dynamic slug-based routing (`/[tenant]`) with database queries strictly scoped by `tenant_id`.
- **Merchant Onboarding**: Atomic store and owner registration using database transactions (`POST /api/tenants/register`).
- **Store Owner Admin Portal**:
  - Secure JWT authentication with `localStorage` persistence.
  - Analytics dashboard (Total Revenue, Total Orders, Active Products).
  - Add/Edit product modal supporting images, price, stock, and inline product deletion.
  - Interactive order management with color-coded status badges (`pending`, `paid`, `shipped`, `delivered`, `cancelled`).
- **Public Customer Storefront**:
  - Dynamic store layout with shimmer skeleton loading states.
  - Responsive product grid with image previews and fallback visual gradient placeholders.
  - Slide-out Cart Drawer with quantity adjustment, stock limit enforcement, and instant order placement.
  - Non-intrusive toast notifications for real-time user feedback.
- **Editorial UI/UX**: Designed with crisp 1px borders, Inter + JetBrains Mono typography, dark mode CSS variables, and modern micro-interactions (press states, shimmer skeletons).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Node.js, Express.js 5
- **Database**: PostgreSQL (Supabase) via `pg` pool
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` password hashing

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
│   ├── app/globals.css         # Tailwind v4 & Editorial Design System
│   └── app/layout.js           # Root Layout & Fonts (Inter + JetBrains Mono)
├── db.js                       # PostgreSQL Pool Setup (Supabase SSL)
├── server.js                   # Express.js REST API Server
└── supabase-migration.sql      # Idempotent Database Setup Script
```

---

## 🚀 Getting Started

### 1. Database Setup (Supabase)
Paste and execute the contents of [`supabase-migration.sql`](./supabase-migration.sql) inside your **Supabase SQL Editor**. This sets up:
- `image_url` column on `products`
- Foreign key constraints with `ON DELETE CASCADE`
- Performance indexes on `tenant_id` and `slug`
- Default order status (`pending`)

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/postgres
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
```

### 3. Install & Run Locally

#### Backend Server:
```bash
# Install dependencies
npm install

# Start Express API server
node server.js
```
The server will start on `http://localhost:5000`.

#### Frontend Application:
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run Next.js dev server
npm run dev
```
The frontend will start on `http://localhost:3000`.

---

## 🔗 Route Map & URLs

| Page | URL Path | Description |
|---|---|---|
| **Platform Landing** | `http://localhost:3000/` | Main platform landing page |
| **Launch Store** | `http://localhost:3000/register-store` | Register new store & owner account |
| **Customer Storefront** | `http://localhost:3000/[slug]` | Public customer shopping page |
| **Store Admin Portal** | `http://localhost:3000/[slug]/admin` | Merchant management dashboard |

---

## 📡 API Endpoints Summary

### Auth & Tenant Management
- `POST /api/tenants/register` — Atomic store and merchant account registration
- `POST /api/auth/login` — Store owner authentication

### Products API
- `GET /api/products?tenant={slug}` — Public product listing
- `POST /api/products?tenant={slug}` — Add product *(Protected)*
- `PUT /api/products/:id?tenant={slug}` — Update product *(Protected)*
- `DELETE /api/products/:id?tenant={slug}` — Delete product *(Protected)*

### Orders & Analytics
- `POST /api/orders?tenant={slug}` — Customer order placement with stock check
- `GET /api/orders?tenant={slug}` — Store order list *(Protected)*
- `PATCH /api/orders/:id?tenant={slug}` — Status update *(Protected)*
- `POST /api/orders/:id/pay?tenant={slug}` — Payment confirmation
- `GET /api/admin/stats?tenant={slug}` — Revenue and store metrics *(Protected)*

---

## 🌐 Production Deployment

- **Database**: Supabase PostgreSQL (Cloud)
- **Backend**: Render / Railway (`node server.js`)
- **Frontend**: Vercel (Root directory: `client`)
