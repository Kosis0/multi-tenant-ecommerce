-- ====================================================================
-- SUPABASE MIGRATION V5 — TENANT SETTINGS & SECURITY HARDENING
-- Paste this script into your Supabase SQL Editor and click RUN.
-- ====================================================================

-- 1. Ensure all tenant settings columns exist
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS show_flash_deals BOOLEAN DEFAULT TRUE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_product_id INTEGER;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_badge VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;

-- 2. Add performance index on reviews if not exists
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
