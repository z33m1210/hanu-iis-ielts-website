const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { postSchemas } = require('../utils/validationSchemas');

// Public routes (Optional: list all posts)
router.get('/', postController.getPosts);

// Admin routes
router.use(authenticateToken, requireRole(['ADMIN']));

router.post('/', validateRequest(postSchemas.create), postController.createPost);
router.put('/:id', validateRequest(postSchemas.update), postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
