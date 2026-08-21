const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/response');

const getStats = async (req, res) => {
  const stats = await analyticsService.getAdminStats(req.tenant);
  sendSuccess(res, stats);
};

module.exports = {
  getStats
};
