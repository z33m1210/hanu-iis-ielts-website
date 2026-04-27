const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/my', authenticateToken, reviewController.getMyReviews);
router.get('/:courseId', reviewController.getCourseReviews);
router.get('/:courseId/can-review', authenticateToken, reviewController.checkCanReview);
router.post('/', authenticateToken, reviewController.createReview);

module.exports = router;
