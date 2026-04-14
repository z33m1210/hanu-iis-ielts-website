const prisma = require('../models/prismaClient');

exports.getCourses = async (req, res, next) => {
  try {
    const { category, search, level, sortBy } = req.query;

    const where = { isPublished: true };
    if (category) where.category = category.toLowerCase();
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (level) where.level = level;

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-low') orderBy = { price: 'asc' };
    if (sortBy === 'price-high') orderBy = { price: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };

    const courses = await prisma.course.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            title: true,
          }
        }
      },
      orderBy,
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error in controller:', error);
    next(error);
  }
};

exports.getTopCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      take: 4,
      orderBy: { rating: 'desc' },
      include: {
        teacher: {
          select: { name: true }
        }
      }
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error in controller:', error);
    next(error);
  }
};

exports.getTopInstructors = async (req, res, next) => {
  try {
    const instructors = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      take: 5,
      orderBy: { instructorStudents: 'desc' }, // Simple proxy for popularity
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        title: true,
        bio: true,
        instructorReviews: true,
        instructorStudents: true,
      }
    });
    res.json({ success: true, instructors });
  } catch (error) {
    console.error('Error in controller:', error);
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: true,
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error('Error in controller:', error);
    next(error);
  }
};
