const prisma = require('../models/prismaClient');

exports.getCourseReviews = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 5 } = req.query;

        const reviews = await prisma.review.findMany({
            where: { courseId: parseInt(courseId) },
            include: {
                user: {
                    select: { name: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        const total = await prisma.review.count({
            where: { courseId: parseInt(courseId) }
        });

        // Calculate distribution
        const stats = await prisma.review.groupBy({
            by: ['rating'],
            where: { courseId: parseInt(courseId) },
            _count: true
        });

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        stats.forEach(s => distribution[s.rating] = s._count);

        res.json({ success: true, reviews, total, distribution });
    } catch (error) {
        next(error);
    }
};

exports.createReview = async (req, res, next) => {
    try {
        const { courseId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check if user has a completed purchase (enrollment linked to a payment)
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: userId,
                courseId: parseInt(courseId),
                paymentId: { not: null }
            }
        });

        if (!enrollment && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only verified buyers can review this course.' });
        }

        const review = await prisma.review.upsert({
            where: {
                userId_courseId: {
                    userId,
                    courseId: parseInt(courseId)
                }
            },
            update: { rating: parseInt(rating), comment },
            create: {
                userId,
                courseId: parseInt(courseId),
                rating: parseInt(rating),
                comment
            }
        });

        // Update course average rating
        const allReviews = await prisma.review.findMany({
            where: { courseId: parseInt(courseId) },
            select: { rating: true }
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await prisma.course.update({
            where: { id: parseInt(courseId) },
            data: {
                rating: avgRating,
                ratingCount: allReviews.length
            }
        });

        res.json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

exports.checkCanReview = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // 1. Check Enrollment & Payment
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: userId,
                courseId: parseInt(courseId),
                paymentId: { not: null }
            }
        });

        if (!enrollment && req.user.role !== 'ADMIN') {
            return res.json({ 
                success: true, 
                canReview: false, 
                reason: 'NOT_ENROLLED',
                message: 'Only verified buyers can review this course.' 
            });
        }

        // 2. Check for Existing Review
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: parseInt(courseId)
                }
            }
        });

        if (existingReview) {
            return res.json({ 
                success: true, 
                canReview: false, 
                reason: 'ALREADY_REVIEWED',
                message: 'You have already reviewed this course.',
                review: existingReview
            });
        }

        res.json({ success: true, canReview: true });
    } catch (error) {
        next(error);
    }
};

exports.getMyReviews = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reviews = await prisma.review.findMany({
            where: { userId },
            include: {
                course: {
                    select: { id: true, title: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, reviews });
    } catch (error) {
        next(error);
    }
};
