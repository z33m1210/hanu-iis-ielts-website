const prisma = require('../models/prismaClient');

exports.getCourses = async (req, res, next) => {
  try {
    const { category, search, level, sortBy, admin, exclude, limit } = req.query;

    const where = {};
    if (admin !== 'true') {
      where.isPublished = true;
    }
    if (category) where.category = category.toLowerCase();
    
    // Exclude specific ID (e.g. current course)
    if (exclude) {
      where.id = { not: parseInt(exclude) };
    }

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
      take: limit ? parseInt(limit) : undefined,
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
    const courseId = parseInt(id);

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Manual fetch of relations to bypass stale prisma client inclusions
    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        user: { select: { name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const faqs = await prisma.fAQ.findMany({
      where: { courseId }
    }).catch(() => []); // Fallback if FAQ table is missing

    res.json({ 
      success: true, 
      course: { 
        ...course, 
        thumbnail: course.image, // Map image to thumbnail for frontend consistency
        reviews, 
        faqs 
      } 
    });
  } catch (error) {
    console.error('Error in controller:', error);
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, price, originalPrice, level, category, hours, lectures, chapters, thumbnail, syllabus } = req.body;
    
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
        image: thumbnail, // Map thumbnail to image
        syllabus: syllabus || "[]",
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
    const body = req.body;

    // Mapping frontend names to database names
    const data = { ...body };
    
    if (data.thumbnail !== undefined) {
      data.image = data.thumbnail;
      delete data.thumbnail;
    }

    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
    if (data.hours !== undefined) data.hours = parseInt(data.hours);
    if (data.lectures !== undefined) data.lectures = parseInt(data.lectures);
    if (data.chapters !== undefined) data.chapters = parseInt(data.chapters);
    
    // Explicitly ensure syllabus is included
    if (body.syllabus !== undefined) {
      data.syllabus = body.syllabus;
    }

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({ success: true, course });
  } catch (error) {
    console.error('Update Course Error:', error);
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
