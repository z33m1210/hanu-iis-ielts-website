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
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/orders', adminController.getOrders);
router.get('/unread-orders-count', adminController.getUnreadOrdersCount);
router.patch('/orders/:id/read', adminController.markOrderAsRead);
router.patch('/orders/:id/fulfill', adminController.fulfillOrder);

module.exports = router;
