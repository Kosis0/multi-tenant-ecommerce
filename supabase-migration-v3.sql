-- ====================================================================
-- SUPABASE MIGRATION V3 — PRODUCT VARIANTS
-- Paste this script into your Supabase SQL Editor and click RUN.
-- ====================================================================

-- 1. Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'Size', 'Color'
  value TEXT NOT NULL, -- e.g., 'XL', 'Red'
  stock INTEGER DEFAULT 0,
  price_adjustment NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, name, value)
);

-- 2. Create performance index
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- 3. Modify order_items to support tracking which variant was purchased
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_info JSONB;
