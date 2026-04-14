const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getCourses);
router.get('/top', courseController.getTopCourses);
router.get('/instructors/top', courseController.getTopInstructors);
router.get('/:id', courseController.getCourseById);

module.exports = router;
