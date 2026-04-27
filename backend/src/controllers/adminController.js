const prisma = require('../models/prismaClient');

exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role.toUpperCase();
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const usersWithOnlineStatus = users.map(user => ({
      ...user,
      isOnline: user.lastActive ? (now - new Date(user.lastActive)) < 300000 : false // 5 minutes
    }));

    res.json({ success: true, users: usersWithOnlineStatus });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, role },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: { id: true, email: true, isActive: true, role: true }
    });

    res.json({ success: true, updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Perform cascading delete in a transaction to handle foreign key constraints
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { userId: userId } }),
      prisma.wishlist.deleteMany({ where: { userId: userId } }),
      // Delete enrollments first as they may reference payments
      prisma.enrollment.deleteMany({ where: { studentId: userId } }),
      prisma.payment.deleteMany({ where: { studentId: userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.json({ success: true, message: 'User and all associated data deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core Totals
    const totalUsers = await prisma.user.count();
    const totalCourses = await prisma.course.count();

    // 2. Active Users (15 minute window)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsers = await prisma.user.count({ 
      where: { 
        lastActive: { gte: fifteenMinutesAgo }
      } 
    });

    // 3. Enrollment Trends (Last 7 Days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const enrollmentStats = await prisma.enrollment.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true }
    });

    // Grouping by date
    const trendsMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      trendsMap[dateStr] = 0;
    }

    enrollmentStats.forEach(e => {
      const dateStr = e.createdAt.toISOString().split('T')[0];
      if (trendsMap[dateStr] !== undefined) {
        trendsMap[dateStr]++;
      }
    });

    const enrollmentTrends = Object.entries(trendsMap).map(([date, count]) => ({ date, count }));

    // 4. Recent Activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true, role: true }
    });

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true } },
        course: { select: { title: true } }
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalCourses,
        unreadOrders: await prisma.payment.count({ where: { isRead: false } }),
        performance: 99 
      },
      enrollmentTrends,
      recentActivity: {
        users: recentUsers,
        enrollments: recentEnrollments
      }
    });
  } catch (error) {
    next(error);
  }
};

const emailService = require('../services/emailService');

exports.getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const orders = await prisma.payment.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
        enrollments: {
          include: { course: { select: { title: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.fulfillOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driveLink } = req.body;

    if (!driveLink) {
      return res.status(400).json({ success: false, message: 'Drive link is required.' });
    }

    const order = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: { student: { select: { email: true, name: true } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Send fulfillment email
    const emailRes = await emailService.sendEmail(
      order.student.email,
      "Your Course Access: BandPath IELTS",
      `Hello ${order.student.name || 'Student'},\n\nYour order #${order.id} has been fulfilled! You can access your materials here:\n\n${driveLink}\n\nHappy studying!`
    );

    if (!emailRes.success) {
      return res.status(500).json({ success: false, message: 'Failed to send fulfillment email.' });
    }

    // Update status to FULFILLED and mark as read
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'FULFILLED',
        isRead: true
      }
    });

    res.json({ success: true, message: 'Order fulfilled successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadOrdersCount = async (req, res, next) => {
  try {
    const count = await prisma.payment.count({
      where: { isRead: false }
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

exports.markOrderAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
