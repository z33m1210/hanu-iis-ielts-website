const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/my', authenticateToken, enrollmentController.getMyEnrollments);

module.exports = router;
