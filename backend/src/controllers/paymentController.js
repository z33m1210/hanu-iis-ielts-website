const prisma = require('../models/prismaClient');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const axios = require('axios');

// ── MoMo Signature Helper ────────────────────────────────────
function createSignature(data, secretKey) {
  const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(Buffer.from(rawSignature, 'utf-8'))
    .digest('hex');
    
  return signature;
}

exports.processCheckout = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const studentEmail = req.user.email;
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No courses provided.' });
    }

    const numericCourseIds = courseIds.map(id => parseInt(id));

    // 1. Double-Enrollment Guard
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        courseId: { in: numericCourseIds }
      }
    });

    if (existingEnrollments.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already own one or more of these courses.' 
      });
    }

    // 2. Server-Side Price Verification
    const courses = await prisma.course.findMany({
      where: { id: { in: numericCourseIds } },
      select: { id: true, price: true, title: true }
    });

    if (courses.length !== courseIds.length) {
      return res.status(400).json({ success: false, message: 'One or more invalid course IDs.' });
    }

    const totalAmountUSD = courses.reduce((sum, c) => sum + (c.price || 0), 0);
    const orderId = `LOCAL-${Date.now()}`;

    // 3. Atomic Transaction (Payment + Enrollment)
    const result = await prisma.$transaction(async (tx) => {
      // Create COMPLETED payment record
      const payment = await tx.payment.create({
        data: {
          studentId,
          amount: totalAmountUSD,
          status: 'COMPLETED',
          provider: 'LOCAL_MOCK',
          orderId,
          requestId: orderId,
          isRead: false
        }
      });

      // Create Enrollment records
      const enrollments = await Promise.all(
        numericCourseIds.map(courseId => 
          tx.enrollment.create({
            data: {
              studentId,
              courseId,
              paymentId: payment.id
            }
          })
        )
      );

      return { payment, enrollments };
    });

    // 4. Non-Blocking Email Logic
    try {
      const courseTitles = courses.map(c => c.title).join(', ');
      await emailService.sendEmail(
        studentEmail,
        'Purchase Confirmation - BandPath IELTS',
        `Hello,\n\nThank you for your purchase! You have successfully enrolled in: ${courseTitles}.\n\nOrder ID: ${orderId}\nAmount: $${totalAmountUSD.toFixed(2)}\n\nYou can now access your courses in your profile dashboard.\n\nBest regards,\nThe BandPath Team`
      );
    } catch (emailError) {
      console.error('Non-blocking Email Error:', emailError);
      // We do NOT return error here, fulfillment was successful
    }

    // 5. Final Handover
    return res.json({ 
      success: true, 
      message: 'Checkout successful!', 
      redirectUrl: '/order-completed/' 
    });

  } catch (error) {
    console.error('Checkout Transaction Error:', error);
    next(error);
  }
};
