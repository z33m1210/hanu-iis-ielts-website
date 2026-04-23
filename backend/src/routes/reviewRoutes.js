const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/:courseId', reviewController.getCourseReviews);
router.post('/', authenticateToken, reviewController.createReview);

module.exports = router;
