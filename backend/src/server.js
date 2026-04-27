require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();

// Startup Directory Check
const fs = require('fs');
const requiredDirs = [
  path.join(__dirname, '../../public/uploads/audio'),
  path.join(__dirname, '../../public/uploads/documents'),
  path.join(__dirname, '../../public/uploads/courses'),
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quiz', quizRoutes);


// Static frontend files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve uploaded avatars at /uploads/avatars/
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Root route redirects to the home page
app.get('/', (req, res) => {
  res.redirect('/');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('✅ Prisma connected to database');
});

module.exports = app;
