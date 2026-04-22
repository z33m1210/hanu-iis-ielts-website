const prisma = require('../models/prismaClient');

exports.toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required.' });
    }

    const cId = parseInt(courseId);

    // Check if it already exists
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: cId
        }
      }
    });

    if (existing) {
      // Remove it
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return res.json({ success: true, message: 'Removed from wishlist.', action: 'removed' });
    } else {
      // Add it
      await prisma.wishlist.create({
        data: {
          userId,
          courseId: cId
        }
      });
      return res.json({ success: true, message: 'Added to wishlist.', action: 'added' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const courses = wishlistItems.map(item => item.course);
    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

exports.checkWishlistStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const item = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: parseInt(courseId)
        }
      }
    });

    res.json({ success: true, isWishlisted: !!item });
  } catch (error) {
    next(error);
  }
};
