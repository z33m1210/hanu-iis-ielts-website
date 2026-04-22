const prisma = require('../models/prismaClient');

exports.getCourses = async (req, res, next) => {
  try {
    const { category, search, level, sortBy, admin } = req.query;

    const where = {};
    if (admin !== 'true') {
      where.isPublished = true;
    }
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
      orderBy: { rating: 'desc' }
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error in controller:', error);
    next(error);
  }
};


exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) }
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

exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, price, originalPrice, level, category, hours, lectures, chapters } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        level: level || 'Beginner',
        category: category || 'full',
        hours: parseInt(hours) || 0,
        lectures: parseInt(lectures) || 0,
        chapters: parseInt(chapters) || 0,
        isPublished: false
      }
    });

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.price) data.price = parseFloat(data.price);

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
