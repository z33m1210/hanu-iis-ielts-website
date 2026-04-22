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

    // Optional: Check if user has associated enrollments/courses before deleting
    // In a real system, you might do a cascading delete or soft delete

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'User deleted successfully.' });
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
        performance: 99 // Mocked system health percentage
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
