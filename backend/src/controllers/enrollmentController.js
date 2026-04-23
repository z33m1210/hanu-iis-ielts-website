const prisma = require('../models/prismaClient');

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
};

exports.checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: parseInt(courseId)
        }
      }
    });

    res.json({ success: true, isEnrolled: !!enrollment });
  } catch (error) {
    next(error);
  }
};
