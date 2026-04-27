const prisma = require('../models/prismaClient');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ── Multer storage config ──────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Saves to project-root/public/uploads/avatars
    const dir = path.join(__dirname, '../../../public/uploads/avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Rename to avatar-{userId}.ext — overwrites old file, no duplicates
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.params.id}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, and .webp images are allowed.'), false);
    }
  }
});

// ── Upload Avatar Handler ──────────────────────────────────────
exports.uploadAvatar = [
  avatarUpload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file received.' });
      }

      // Authorization: users can only update their own avatar
      if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      // Build the public URL path the frontend will use to load the image
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Persist avatarUrl in the database
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { avatarUrl },
        select: { id: true, name: true, avatarUrl: true }
      });

      res.json({ success: true, avatarUrl: updatedUser.avatarUrl });

    } catch (error) {
      // Multer errors (like size limit) will be caught here
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${error.message}` });
      }
      next(error);
    }
  }
];

exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ensure standard users can only access their own profile
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, password, avatarUrl } = req.body;
    
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: { id: true, email: true, name: true, avatarUrl: true, role: true }
    });

    res.json({ success: true, updatedUser });
  } catch (error) {
    next(error);
  }
};
