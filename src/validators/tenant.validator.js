const { z } = require('zod');

const tenantSettingsSchema = z.object({
  show_flash_deals: z.boolean().optional(),
  hero_product_id: z.union([z.string().uuid(), z.string(), z.number()]).nullable().optional(),
  hero_badge: z.string().trim().max(100).nullable().optional(),
  hero_title: z.string().trim().max(200).nullable().optional(),
  hero_subtitle: z.string().trim().max(1000).nullable().optional()
});

module.exports = {
  tenantSettingsSchema
};
