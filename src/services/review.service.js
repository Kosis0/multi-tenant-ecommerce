const pool = require('../config/db');
const { withTransaction } = require('../config/db');
const { NotFoundError } = require('../errors');

/**
 * Retrieves reviews for a specific product scoped to tenant.
 */
const listProductReviews = async (tenantId, productId) => {
  const { rows } = await pool.query(
    `SELECT id, author_name, rating, comment, created_at 
     FROM reviews 
     WHERE tenant_id = $1 AND product_id = $2 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [tenantId, productId]
  );
  return rows;
};

/**
 * Adds a new review for a product and recalculates average rating and review count.
 */
const createProductReview = async (tenantId, productId, { authorName = 'Verified Buyer', rating = 5, comment }) => {
  return withTransaction(async (client) => {
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1 AND tenant_id = $2',
      [productId, tenantId]
    );

    if (productCheck.rows.length === 0) {
      throw new NotFoundError('Product not found');
    }

    const { rows: newReview } = await client.query(
      `INSERT INTO reviews (tenant_id, product_id, author_name, rating, comment) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [tenantId, productId, authorName, rating, comment]
    );

    // Recalculate average rating & review count for product
    const { rows: stats } = await client.query(
      `SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*)::int as total_reviews 
       FROM reviews 
       WHERE tenant_id = $1 AND product_id = $2`,
      [tenantId, productId]
    );

    if (stats.length > 0) {
      await client.query(
        `UPDATE products 
         SET rating = $1, review_count = $2 
         WHERE id = $3 AND tenant_id = $4`,
        [stats[0].avg_rating || 5, stats[0].total_reviews || 1, productId, tenantId]
      );
    }

    return newReview[0];
  });
};

module.exports = {
  listProductReviews,
  createProductReview
};
