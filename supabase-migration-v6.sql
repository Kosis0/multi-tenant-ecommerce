-- ====================================================================
-- SUPABASE MIGRATION V6 — CONCURRENCY, CONSTRAINTS & SECURITY HARDENING
-- Paste this script into your Supabase SQL Editor and click RUN.
-- ====================================================================

-- 1. Fix hero_product_id type mismatch in tenants table (UUID references products.id)
ALTER TABLE tenants DROP COLUMN IF EXISTS hero_product_id;
ALTER TABLE tenants ADD COLUMN hero_product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- 2. Add database-level check constraints for non-negative inventory and pricing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price_non_negative') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_price_non_negative CHECK (price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_stock_non_negative') THEN
    ALTER TABLE product_variants ADD CONSTRAINT chk_variants_stock_non_negative CHECK (stock >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_qty_positive') THEN
    ALTER TABLE order_items ADD CONSTRAINT chk_order_items_qty_positive CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_price_non_negative') THEN
    ALTER TABLE order_items ADD CONSTRAINT chk_order_items_price_non_negative CHECK (unit_price >= 0);
  END IF;
END $$;

-- 3. Add Stripe payment tracking & payment method to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

-- 4. Create Webhook Events table for Stripe Idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

-- 5. Add token versioning for instant auth revocation
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;

-- 6. Add composite performance indexes for multi-tenant high-throughput queries
CREATE INDEX IF NOT EXISTS idx_products_tenant_created ON products(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tenant_product ON reviews(tenant_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_tenant ON webhook_events(tenant_id);
