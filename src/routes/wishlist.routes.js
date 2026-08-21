const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const resolveTenant = require('../middleware/resolveTenant');
const validate = require('../middleware/validate');
const { wishlistAddSchema } = require('../validators/wishlist.validator');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', resolveTenant, asyncHandler(wishlistController.getWishlist));
router.post('/', resolveTenant, validate(wishlistAddSchema), asyncHandler(wishlistController.addToWishlist));
router.delete('/:productId', resolveTenant, asyncHandler(wishlistController.removeFromWishlist));

module.exports = router;
