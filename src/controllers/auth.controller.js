const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const register = async (req, res) => {
  const result = await authService.registerStore(req.body);
  sendSuccess(res, result, 201);
};

const login = async (req, res) => {
  const result = await authService.loginOwner(req.body);
  sendSuccess(res, result);
};

module.exports = {
  register,
  login
};
