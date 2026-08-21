const pool = require('../config/db');
const { sendSuccess } = require('../utils/response');

const getHealth = async (req, res) => {
  await pool.query('SELECT 1');
  sendSuccess(res, { status: 'healthy' });
};

module.exports = {
  getHealth
};
