const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const uploadController = require('../controllers/uploadController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Public routes (Anonymous access)
router.get('/', quizController.getQuestions);
router.post('/check', quizController.checkAnswers);
router.post('/validate-answer', quizController.validateAnswer);
router.post('/email-results', quizController.emailResults);

// Admin routes (Protected)
const adminAuth = [authenticateToken, requireRole(['ADMIN'])];
router.get('/admin/all', adminAuth, quizController.adminGetQuestions);
router.post('/admin/create', adminAuth, quizController.adminCreateQuestion);
router.put('/admin/update/:id', adminAuth, quizController.adminUpdateQuestion);
router.delete('/admin/delete/:id', adminAuth, quizController.adminDeleteQuestion);
router.post('/admin/upload', adminAuth, uploadController.uploadQuizAudio);
router.post('/admin/upload-doc', adminAuth, uploadController.uploadQuizDocument);




module.exports = router;
