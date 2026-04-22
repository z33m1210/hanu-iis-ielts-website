const prisma = require('../models/prismaClient');

// Get all posts (blog, articles, resources)
exports.getPosts = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    
    const where = {};
    if (type) where.type = type.toUpperCase();
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// Create a new post
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, type, status } = req.body;
    const authorId = req.user.id; // From authenticateToken middleware

    const post = await prisma.post.create({
      data: {
        title,
        content,
        type: type || 'ARTICLE',
        status: status || 'DRAFT',
        authorId
      }
    });

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// Update a post
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, type, status } = req.body;

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, content, type, status }
    });

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// Delete a post
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
