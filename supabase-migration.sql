-- Paste this script into the Supabase SQL Editor to apply migrations.

-- 1. Add image_url TEXT to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Set default on orders.status to 'pending'
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Drop and recreate FK constraints with ON DELETE CASCADE
DO $$
BEGIN
    -- users -> tenants
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'users_tenant_id_fkey' AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_tenant_id_fkey;
    END IF;
    ALTER TABLE users ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

    -- products -> tenants
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'products_tenant_id_fkey' AND table_name = 'products'
    ) THEN
        ALTER TABLE products DROP CONSTRAINT products_tenant_id_fkey;
    END IF;
    ALTER TABLE products ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

    -- orders -> tenants
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'orders_tenant_id_fkey' AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_tenant_id_fkey;
    END IF;
    ALTER TABLE orders ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

    -- order_items -> orders
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'order_items_order_id_fkey' AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items DROP CONSTRAINT order_items_order_id_fkey;
    END IF;
    ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

    -- order_items -> products
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'order_items_product_id_fkey' AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items DROP CONSTRAINT order_items_product_id_fkey;
    END IF;
    ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
END $$;

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
