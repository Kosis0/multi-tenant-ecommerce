const checkoutService = require('../services/checkout.service');
const { sendSuccess } = require('../utils/response');

const createSession = async (req, res) => {
  const result = await checkoutService.createCheckoutSession(req.tenant, {
    items: req.body.items,
    origin: req.get('origin')
  });
  sendSuccess(res, result);
};

module.exports = {
  createSession
};
