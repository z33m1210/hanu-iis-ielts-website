const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { authSchemas } = require('../utils/validationSchemas');

router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.post('/recover-password', authController.recoverPassword);

module.exports = router;
