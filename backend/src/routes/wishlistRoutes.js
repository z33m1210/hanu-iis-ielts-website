const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken); // Ensure all wishlist routes are protected

// Add/remove from wishlist
router.post('/toggle', wishlistController.toggleWishlist);

// Get wishlist status for a specific course
router.get('/status/:courseId', wishlistController.checkWishlistStatus);

// Get user's complete wishlist
router.get('/', wishlistController.getWishlist);

module.exports = router;
