const Stripe = require('stripe');
const env = require('./env');

let stripe = null;
const isConfigured = Boolean(env.STRIPE_SECRET_KEY);

if (isConfigured) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY);
}

module.exports = {
  stripe,
  isConfigured,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET
};
