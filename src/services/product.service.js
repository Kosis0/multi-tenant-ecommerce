const pool = require('../config/db');
const { withTransaction } = require('../config/db');
const { NotFoundError } = require('../errors');

/**
 * Lists products for a store tenant with search, category filtering, and pagination.
 */
const listProducts = async (tenant, { category, search, page = 1, limit = 50 }) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  let query = `
    SELECT products.id, products.title, products.price, products.stock, products.image_url, 
           COALESCE(products.category, 'General') as category, 
           products.description, products.original_price, 
           COALESCE(products.is_featured, false) as is_featured, 
           COALESCE(products.is_new_arrival, false) as is_new_arrival, 
           COALESCE(products.rating, 4.5) as rating, 
           COALESCE(products.review_count, 12) as review_count,
           COALESCE(products.discount_percent, 20) as discount_percent,
           COALESCE(products.flash_sale_units, products.stock) as flash_sale_units,
           COALESCE(products.images, '[]') as images,
           (SELECT COALESCE(json_agg(json_build_object(
               'id', pv.id, 'name', pv.name, 'value', pv.value, 
               'stock', pv.stock, 'price_adjustment', pv.price_adjustment
            )), '[]'::json) FROM product_variants pv WHERE pv.product_id = products.id) as variants
    FROM products 
    WHERE products.tenant_id = $1
  `;
  let countQuery = `SELECT COUNT(*) FROM products WHERE tenant_id = $1`;
  const queryParams = [tenant.id];

  if (category && category !== 'All') {
    queryParams.push(category);
    query += ` AND category = $${queryParams.length}`;
    countQuery += ` AND category = $${queryParams.length}`;
  }

  if (search && typeof search === 'string' && search.trim()) {
    queryParams.push(`%${search.trim()}%`);
    query += ` AND (title ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
    countQuery += ` AND (title ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
  }

  query += ` ORDER BY created_at DESC, id DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

  const countRes = await pool.query(countQuery, queryParams);
  const totalItems = parseInt(countRes.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / safeLimit);

  const { rows: products } = await pool.query(query, [...queryParams, safeLimit, offset]);

  // Fetch categories for tenant
  const { rows: categories } = await pool.query(
    'SELECT id, name, icon FROM categories WHERE tenant_id = $1 ORDER BY name ASC',
    [tenant.id]
  );

  return {
    store: {
      name: tenant.name,
      slug: tenant.slug,
      show_flash_deals: tenant.show_flash_deals !== false,
      hero_product_id: tenant.hero_product_id || null,
      hero_badge: tenant.hero_badge || null,
      hero_title: tenant.hero_title || null,
      hero_subtitle: tenant.hero_subtitle || null
    },
    products,
    categories,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages
    }
  };
};

/**
 * Retrieves a single product by ID scoped to tenant.
 */
const getProductById = async (tenantId, productId) => {
  const { rows } = await pool.query(
    `SELECT products.*,
            (SELECT COALESCE(json_agg(json_build_object(
               'id', pv.id, 'name', pv.name, 'value', pv.value, 
               'stock', pv.stock, 'price_adjustment', pv.price_adjustment
             )), '[]'::json) FROM product_variants pv WHERE pv.product_id = products.id) as variants
     FROM products 
     WHERE products.id = $1 AND products.tenant_id = $2`,
    [productId, tenantId]
  );

  if (rows.length === 0) {
    throw new NotFoundError('Product not found');
  }

  return rows[0];
};

/**
 * Creates a new product with optional variants inside a database transaction.
 */
const createProduct = async (tenantId, productData) => {
  const {
    title,
    price,
    stock,
    image_url,
    category = 'General',
    description = '',
    original_price = null,
    is_featured = false,
    is_new_arrival = false,
    discount_percent = 20,
    flash_sale_units = null,
    images = [],
    variants = []
  } = productData;

  const imagesJson = typeof images === 'string' ? images : JSON.stringify(images);

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO products (
        title, price, stock, image_url, tenant_id, 
        category, description, original_price, is_featured, is_new_arrival,
        discount_percent, flash_sale_units, images
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        title,
        price,
        stock,
        image_url || null,
        tenantId,
        category,
        description,
        original_price,
        is_featured,
        is_new_arrival,
        discount_percent,
        flash_sale_units || stock,
        imagesJson
      ]
    );

    const newProduct = rows[0];

    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, name, value, stock, price_adjustment) 
           VALUES ($1, $2, $3, $4, $5)`,
          [newProduct.id, v.name, v.value, v.stock || 0, v.price_adjustment || 0]
        );
      }
    }

    const vRows = await client.query(
      'SELECT id, name, value, stock, price_adjustment FROM product_variants WHERE product_id = $1',
      [newProduct.id]
    );
    newProduct.variants = vRows.rows;

    return newProduct;
  });
};

/**
 * Updates an existing product and its variants safely inside a database transaction.
 */
const updateProduct = async (tenantId, productId, productData) => {
  const {
    title,
    price,
    stock,
    image_url,
    category,
    description,
    original_price,
    is_featured,
    is_new_arrival,
    discount_percent,
    flash_sale_units,
    images,
    variants
  } = productData;

  const imagesJson = images !== undefined ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE products 
       SET title = COALESCE($1, title), 
           price = COALESCE($2, price), 
           stock = COALESCE($3, stock), 
           image_url = COALESCE($4, image_url),
           category = COALESCE($5, category),
           description = COALESCE($6, description),
           original_price = COALESCE($7, original_price),
           is_featured = COALESCE($8, is_featured),
           is_new_arrival = COALESCE($9, is_new_arrival),
           discount_percent = COALESCE($10, discount_percent),
           flash_sale_units = COALESCE($11, flash_sale_units),
           images = COALESCE($12, images)
       WHERE id = $13 AND tenant_id = $14 
       RETURNING *`,
      [
        title,
        price,
        stock,
        image_url,
        category,
        description,
        original_price,
        is_featured,
        is_new_arrival,
        discount_percent,
        flash_sale_units,
        imagesJson,
        productId,
        tenantId
      ]
    );

    if (rows.length === 0) {
      throw new NotFoundError('Product not found');
    }

    const updatedProduct = rows[0];

    if (variants !== undefined) {
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [updatedProduct.id]);
      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          await client.query(
            `INSERT INTO product_variants (product_id, name, value, stock, price_adjustment) 
             VALUES ($1, $2, $3, $4, $5)`,
            [updatedProduct.id, v.name, v.value, v.stock || 0, v.price_adjustment || 0]
          );
        }
      }
    }

    const vRows = await client.query(
      'SELECT id, name, value, stock, price_adjustment FROM product_variants WHERE product_id = $1',
      [updatedProduct.id]
    );
    updatedProduct.variants = vRows.rows;

    return updatedProduct;
  });
};

/**
 * Deletes a product scoped to tenant.
 */
const deleteProduct = async (tenantId, productId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM products WHERE id = $1 AND tenant_id = $2',
    [productId, tenantId]
  );

  if (rowCount === 0) {
    throw new NotFoundError('Product not found');
  }

  return { deleted: true };
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
