const wishlistService = require('../services/wishlist.service');
const { sendSuccess, sendError } = require('../utils/response');

const getWishlist = async (req, res) => {
  const { sessionId } = req.query;
  const items = await wishlistService.getWishlist(req.tenant.id, sessionId);
  sendSuccess(res, items);
};

const addToWishlist = async (req, res) => {
  const { sessionId, productId } = req.body;
  if (!sessionId) {
    return sendError(res, 'Session ID required');
  }
  const result = await wishlistService.addToWishlist(req.tenant.id, { sessionId, productId });
  sendSuccess(res, result);
};

const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const { sessionId } = req.query;
  if (!sessionId) {
    return sendError(res, 'Session ID required');
  }
  const result = await wishlistService.removeFromWishlist(req.tenant.id, sessionId, productId);
  sendSuccess(res, result);
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
