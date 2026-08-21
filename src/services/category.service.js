const pool = require('../config/db');
const { NotFoundError } = require('../errors');

/**
 * Retrieves all categories for a store tenant.
 */
const listCategories = async (tenantId) => {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE tenant_id = $1 ORDER BY name ASC',
    [tenantId]
  );
  return rows;
};

/**
 * Creates a new category for a store tenant.
 */
const createCategory = async (tenantId, { name, icon = '📦' }) => {
  const { rows } = await pool.query(
    'INSERT INTO categories (tenant_id, name, icon) VALUES ($1, $2, $3) RETURNING *',
    [tenantId, name.trim(), icon || '📦']
  );
  return rows[0];
};

/**
 * Updates a category for a store tenant.
 */
const updateCategory = async (tenantId, categoryId, { name, icon }) => {
  const { rows } = await pool.query(
    `UPDATE categories 
     SET name = COALESCE($1, name), 
         icon = COALESCE($2, icon) 
     WHERE id = $3 AND tenant_id = $4 
     RETURNING *`,
    [name ? name.trim() : null, icon, categoryId, tenantId]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Category not found');
  }

  return rows[0];
};

/**
 * Deletes a category for a store tenant.
 */
const deleteCategory = async (tenantId, categoryId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM categories WHERE id = $1 AND tenant_id = $2',
    [categoryId, tenantId]
  );

  if (rowCount === 0) {
    throw new NotFoundError('Category not found');
  }

  return { deleted: true };
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
