const pool = require('../config/db');

/**
 * Computes administrative metrics, revenue trends, top sales, and low inventory alerts.
 */
const getAdminStats = async (tenant) => {
  const revenueRes = await pool.query(
    "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE tenant_id = $1 AND status IN ('paid', 'shipped', 'delivered')",
    [tenant.id]
  );

  const orderCountRes = await pool.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [tenant.id]);
  const productCountRes = await pool.query('SELECT COUNT(*) FROM products WHERE tenant_id = $1', [tenant.id]);

  const recentRes = await pool.query(
    'SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 5',
    [tenant.id]
  );

  // Revenue over last 7 days
  const dailyRevenueRes = await pool.query(
    `SELECT DATE(created_at) as date, SUM(total_amount) as revenue
     FROM orders
     WHERE tenant_id = $1 AND status IN ('paid', 'shipped', 'delivered')
       AND created_at >= NOW() - INTERVAL '7 days'
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`,
    [tenant.id]
  );

  // Top 5 Products by Quantity Sold
  const topProductsRes = await pool.query(
    `SELECT p.id, p.title, SUM(oi.quantity) as total_sold
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.tenant_id = $1 AND o.status IN ('paid', 'shipped', 'delivered')
     GROUP BY p.id, p.title
     ORDER BY total_sold DESC
     LIMIT 5`,
    [tenant.id]
  );

  // Low Stock Alerts (5 or fewer units remaining)
  const lowStockRes = await pool.query(
    `SELECT id, title, stock FROM products 
     WHERE tenant_id = $1 AND stock <= 5 
     ORDER BY stock ASC LIMIT 5`,
    [tenant.id]
  );

  return {
    revenue: parseFloat(revenueRes.rows[0]?.revenue || 0),
    totalOrders: parseInt(orderCountRes.rows[0]?.count || 0, 10),
    totalProducts: parseInt(productCountRes.rows[0]?.count || 0, 10),
    recentOrders: recentRes.rows,
    chartData: dailyRevenueRes.rows,
    topProducts: topProductsRes.rows,
    lowStock: lowStockRes.rows,
    storeSettings: {
      show_flash_deals: tenant.show_flash_deals !== false,
      hero_product_id: tenant.hero_product_id || null,
      hero_badge: tenant.hero_badge || null,
      hero_title: tenant.hero_title || null,
      hero_subtitle: tenant.hero_subtitle || null
    }
  };
};

module.exports = {
  getAdminStats
};
