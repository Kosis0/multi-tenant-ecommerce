-- ====================================================================
-- SUPABASE MIGRATION V2 — E-COMMERCE OVERHAUL
-- Paste this script into your Supabase SQL Editor and click RUN.
-- ====================================================================

-- 1. Enhance products table with categories, discount pricing, ratings & flags
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 12;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, product_id)
);

-- 3. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(tenant_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(tenant_id, is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_wishlists_session ON wishlists(tenant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

-- 5. Seed default categories for existing tenants
DO $$
DECLARE
  t_record RECORD;
BEGIN
  FOR t_record IN SELECT id FROM tenants LOOP
    INSERT INTO categories (tenant_id, name, icon) VALUES
      (t_record.id, 'Phones', '📱'),
      (t_record.id, 'Computers', '💻'),
      (t_record.id, 'Smartwatch', '⌚'),
      (t_record.id, 'Camera', '📷'),
      (t_record.id, 'Headphones', '🎧'),
      (t_record.id, 'Gaming', '🎮')
    ON CONFLICT (tenant_id, name) DO NOTHING;
  END LOOP;
END $$;
