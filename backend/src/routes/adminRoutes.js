const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { userSchemas } = require('../utils/validationSchemas');

// All admin routes require authentication and ADMIN role
router.use(authenticateToken, requireRole(['ADMIN']));

router.get('/users', adminController.getUsers);
router.put('/users/:id', validateRequest(userSchemas.adminUpdate), adminController.updateUser);
router.put('/users/:id/status', validateRequest(userSchemas.updateStatus), adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
