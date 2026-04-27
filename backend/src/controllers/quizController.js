const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/emailService');

exports.getQuestions = async (req, res) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category) where.category = category;

        const questions = await prisma.quizQuestion.findMany({
            where,
            select: {
                id: true,
                type: true,
                category: true,
                questionText: true,
                options: true,
                audioUrl: true,
                documentUrl: true,
                sectionId: true,
            }
        });
        
        const formattedQuestions = questions.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : null
        }));

        res.json({ success: true, questions: formattedQuestions });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch quiz questions' });
    }
};

exports.checkAnswers = async (req, res) => {
    try {
        const { answers, category } = req.body; 
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Invalid answers format' });
        }

        const where = {};
        if (category) where.category = category;
        const questions = await prisma.quizQuestion.findMany({ where });
        
        let score = 0;
        const total = questions.length;

        answers.forEach(userAns => {
            const question = questions.find(q => q.id === parseInt(userAns.questionId));
            if (question) {
                const normalizedUserAns = (userAns.answer || '').trim().toLowerCase();
                const normalizedCorrectAns = question.correctAnswer.trim().toLowerCase();
                if (normalizedUserAns === normalizedCorrectAns) score++;
            }
        });

        res.json({ 
            success: true, 
            score: `${score}/${total}`,
            numericScore: score,
            totalQuestions: total,
            category: category || 'General'
        });
    } catch (error) {
        console.error('Error checking quiz answers:', error);
        res.status(500).json({ success: false, message: 'Failed to check answers' });
    }
};

exports.validateAnswer = async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        const question = await prisma.quizQuestion.findUnique({
            where: { id: parseInt(questionId) }
        });

        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const normalizedUserAns = (answer || '').trim().toLowerCase();
        const normalizedCorrectAns = question.correctAnswer.trim().toLowerCase();
        const isCorrect = normalizedUserAns === normalizedCorrectAns;

        res.json({ 
            success: true, 
            isCorrect,
            // Don't return the correct answer here either to prevent scraping
        });
    } catch (error) {
        console.error('Error validating single answer:', error);
        res.status(500).json({ success: false, message: 'Failed to validate answer' });
    }
};

exports.emailResults = async (req, res) => {
    try {
        const { email, score, category } = req.body;

        if (!email || !score) {
            return res.status(400).json({ success: false, message: 'Email and score are required' });
        }

        const testType = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'IELTS';
        const subject = `Your BandPath ${testType} Result`;
        const text = `Congratulations! You have completed the BandPath ${testType} Test.\n\nYour final score is: ${score}\n\nKeep practicing to achieve your target band score!\n\nBest regards,\nBandPath Team`;

        const emailResult = await emailService.sendEmail(email, subject, text);

        if (emailResult.success) {
            res.json({ success: true, message: 'Results emailed successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }
    } catch (error) {
        console.error('Error emailing results:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Admin CRUD operations
exports.adminGetQuestions = async (req, res) => {
    try {
        const questions = await prisma.quizQuestion.findMany();
        const formattedQuestions = questions.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : null
        }));
        res.json({ success: true, questions: formattedQuestions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
};

exports.adminCreateQuestion = async (req, res) => {
    try {
        const { type, category, questionText, options, correctAnswer, audioUrl, documentUrl, sectionId } = req.body;
        const question = await prisma.quizQuestion.create({
            data: {
                type,
                category: category || 'LISTENING',
                questionText,
                options: options ? JSON.stringify(options) : null,
                correctAnswer,
                audioUrl,
                documentUrl,
                sectionId
            }
        });
        res.json({ success: true, question });
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ success: false, message: 'Failed to create question' });
    }
};

exports.adminUpdateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, questionText, options, correctAnswer, audioUrl, documentUrl, sectionId } = req.body;
        const question = await prisma.quizQuestion.update({
            where: { id: parseInt(id) },
            data: {
                type,
                questionText,
                options: options ? JSON.stringify(options) : null,
                correctAnswer,
                audioUrl,
                documentUrl,
                sectionId
            }
        });
        res.json({ success: true, question });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update question' });
    }
};

exports.adminDeleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.quizQuestion.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete question' });
    }
};
