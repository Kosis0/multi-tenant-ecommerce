const pool = require('../config/db');
const { stripe, isConfigured: isStripeConfigured } = require('../config/stripe');
const { BadRequestError } = require('../errors');

/**
 * Generates a verified Stripe Checkout session with server-side price recalculation.
 */
const createCheckoutSession = async (tenant, { items, origin }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Items required');
  }

  const verifiedLineItems = [];

  for (const item of items) {
    const prodId = item.product_id || item.id;
    if (!prodId) continue;

    const prodRes = await pool.query(
      'SELECT id, title, price, image_url FROM products WHERE id = $1 AND tenant_id = $2',
      [prodId, tenant.id]
    );
    if (prodRes.rows.length === 0) continue;

    const product = prodRes.rows[0];
    let unitPrice = Number(product.price);

    if (item.variant_id) {
      const vRes = await pool.query(
        'SELECT price_adjustment FROM product_variants WHERE id = $1 AND product_id = $2',
        [item.variant_id, product.id]
      );
      if (vRes.rows.length > 0) {
        unitPrice += Number(vRes.rows[0].price_adjustment);
      }
    }

    const qty = Math.max(1, Math.min(parseInt(item.quantity, 10) || 1, 100));

    verifiedLineItems.push({
      price_data: {
        currency: 'ngn',
        product_data: {
          name: product.title,
          images: product.image_url ? [product.image_url] : []
        },
        unit_amount: Math.round(unitPrice * 100) // In kobo
      },
      quantity: qty
    });
  }

  if (verifiedLineItems.length === 0) {
    throw new BadRequestError('No valid items found for checkout');
  }

  const baseOrigin = origin || 'http://localhost:3000';

  if (isStripeConfigured && stripe) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: verifiedLineItems,
      mode: 'payment',
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug
      },
      success_url: `${baseOrigin}/${tenant.slug}?checkout=success`,
      cancel_url: `${baseOrigin}/${tenant.slug}?checkout=cancel`
    });

    return { url: session.url, isMock: false };
  }

  // Mock payment gateway response for local/testing environments without active Stripe credentials
  const mockSessionId = `cs_test_${Date.now()}`;
  return {
    url: null,
    isMock: true,
    sessionId: mockSessionId,
    message: 'Stripe Gateway Scaffolding active. Add STRIPE_SECRET_KEY in .env to process real cards.'
  };
};

module.exports = {
  createCheckoutSession
};
