const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { courseSchemas } = require('../utils/validationSchemas');

// Public routes
router.get('/', courseController.getCourses);
router.get('/top', courseController.getTopCourses);
router.get('/:id', courseController.getCourseById);

// Admin routes
router.post('/', authenticateToken, requireRole(['ADMIN']), validateRequest(courseSchemas.create), courseController.createCourse);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), validateRequest(courseSchemas.update), courseController.updateCourse);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), courseController.deleteCourse);

module.exports = router;
