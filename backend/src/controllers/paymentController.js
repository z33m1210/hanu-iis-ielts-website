const prisma = require('../models/prismaClient');

exports.processCheckout = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseIds, amount } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No courses provided.' });
    }

    // Record the payment
    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount,
        status: 'COMPLETED',
        provider: 'MockPayment'
      }
    });

    // Create enrollments (using createMany for efficiency if supported, 
    // but SQLite doesn't support nested createMany easily with connect)
    // We'll use a transaction for safety
    await prisma.$transaction(
      courseIds.map(courseId => 
        prisma.enrollment.upsert({
          where: {
            studentId_courseId: {
              studentId,
              courseId: parseInt(courseId)
            }
          },
          update: {}, // Already enrolled, do nothing
          create: {
            studentId,
            courseId: parseInt(courseId)
          }
        })
      )
    );

    res.json({ success: true, message: 'Checkout successful! You are now enrolled.', paymentId: payment.id });
  } catch (error) {
    next(error);
  }
};
