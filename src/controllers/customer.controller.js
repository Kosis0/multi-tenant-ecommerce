const customerService = require('../services/customer.service');
const { sendSuccess } = require('../utils/response');

const register = async (req, res) => {
  const result = await customerService.registerCustomer(req.tenant.id, req.body);
  sendSuccess(res, result, 201);
};

const login = async (req, res) => {
  const result = await customerService.loginCustomer(req.tenant.id, req.body);
  sendSuccess(res, result);
};

const getOrders = async (req, res) => {
  const orders = await customerService.getCustomerOrders(req.tenant.id, req.customer.customerId);
  sendSuccess(res, orders);
};

module.exports = {
  register,
  login,
  getOrders
};
