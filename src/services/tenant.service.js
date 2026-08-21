const pool = require('../config/db');

/**
 * Updates store tenant customization and landing page settings.
 */
const updateTenantSettings = async (tenantId, currentTenant, settings) => {
  const { show_flash_deals, hero_product_id, hero_badge, hero_title, hero_subtitle } = settings;

  const targetHeroProductId =
    hero_product_id !== undefined
      ? hero_product_id === '' || hero_product_id === null
        ? null
        : hero_product_id
      : currentTenant.hero_product_id;

  const targetShowFlashDeals =
    show_flash_deals !== undefined ? show_flash_deals === true : currentTenant.show_flash_deals !== false;

  await pool.query(
    `UPDATE tenants 
     SET show_flash_deals = COALESCE($1, show_flash_deals),
         hero_product_id = $2,
         hero_badge = COALESCE($3, hero_badge),
         hero_title = COALESCE($4, hero_title),
         hero_subtitle = COALESCE($5, hero_subtitle)
     WHERE id = $6`,
    [
      show_flash_deals !== undefined ? targetShowFlashDeals : null,
      targetHeroProductId,
      hero_badge !== undefined ? hero_badge : null,
      hero_title !== undefined ? hero_title : null,
      hero_subtitle !== undefined ? hero_subtitle : null,
      tenantId
    ]
  );

  return {
    show_flash_deals: targetShowFlashDeals,
    hero_product_id: targetHeroProductId,
    hero_badge: hero_badge !== undefined ? hero_badge : currentTenant.hero_badge,
    hero_title: hero_title !== undefined ? hero_title : currentTenant.hero_title,
    hero_subtitle: hero_subtitle !== undefined ? hero_subtitle : currentTenant.hero_subtitle
  };
};

module.exports = {
  updateTenantSettings
};
