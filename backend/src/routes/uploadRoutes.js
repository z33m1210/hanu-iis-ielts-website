const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Only admins can upload course assets
router.post('/course', authenticateToken, requireRole(['ADMIN']), uploadController.uploadCourseImage);

module.exports = router;
