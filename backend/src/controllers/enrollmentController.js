const prisma = require('../models/prismaClient');

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
};
