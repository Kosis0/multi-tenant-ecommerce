const pool = require('../src/config/db');

async function inspectAndMigrate() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
    console.log('Orders columns:', cols.rows.map(c => `${c.column_name} (${c.data_type})`));

    console.log('Applying migration v6 statements if missing...');
    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 1;
      
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

      CREATE TABLE IF NOT EXISTS webhook_events (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        processed_at TIMESTAMPTZ DEFAULT NOW(),
        payload JSONB
      );
    `);
    console.log('Migration v6 successfully ensured!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

inspectAndMigrate();
