const webhookService = require('../services/webhook.service');

const handleStripe = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const result = await webhookService.handleStripeWebhook(req.body, signature);
  res.status(200).json({ received: true, ...result });
};

module.exports = {
  handleStripe
};
