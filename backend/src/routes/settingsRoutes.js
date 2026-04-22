const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { settingsSchemas } = require('../utils/validationSchemas');

// Get settings (authenticated)
router.get('/', authenticateToken, settingsController.getSettings);

// Admin only: Update settings
router.put('/', authenticateToken, requireRole(['ADMIN']), validateRequest(settingsSchemas.update), settingsController.updateSettings);

module.exports = router;
