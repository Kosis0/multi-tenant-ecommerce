const tenantService = require('../services/tenant.service');
const { sendSuccess } = require('../utils/response');

const updateSettings = async (req, res) => {
  const updatedSettings = await tenantService.updateTenantSettings(req.tenant.id, req.tenant, req.body);
  sendSuccess(res, updatedSettings);
};

module.exports = {
  updateSettings
};
