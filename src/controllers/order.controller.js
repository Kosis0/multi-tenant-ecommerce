const orderService = require('../services/order.service');
const { sendSuccess } = require('../utils/response');

const createOrder = async (req, res) => {
  const newOrder = await orderService.createOrder(req.tenant, {
    items: req.body.items,
    paymentMethod: req.body.paymentMethod,
    email: req.body.email,
    customer: req.customer
  });
  sendSuccess(res, newOrder, 201);
};

const listOrders = async (req, res) => {
  const result = await orderService.listOrders(req.tenant.id, req.query);
  sendSuccess(res, result);
};

const updateOrderStatus = async (req, res) => {
  const updatedOrder = await orderService.updateOrderStatus(req.tenant.id, req.params.id, req.body.status);
  sendSuccess(res, updatedOrder);
};

const settleOrder = async (req, res) => {
  const settledOrder = await orderService.settleOrder(req.tenant.id, req.params.id);
  sendSuccess(res, settledOrder);
};

module.exports = {
  createOrder,
  listOrders,
  updateOrderStatus,
  settleOrder
};
