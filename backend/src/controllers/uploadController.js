const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer storage config for Quiz Audio ──────────────────────
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Saves to project-root/public/uploads/audio
    const dir = path.join(__dirname, '../../../public/uploads/audio');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: audio-{timestamp}.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for audio
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only .mp3 and .wav files are allowed.'), false);
    }
  }
});

exports.uploadQuizAudio = [
  audioUpload.single('audio'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
      }

      // Return the public URL path
      const audioUrl = `/uploads/audio/${req.file.filename}`;
      res.json({ 
        success: true, 
        audioUrl,
        filename: req.file.filename 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

// ── Multer storage config for Course Images ─────────────────────
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Saves to project-root/public/uploads/courses
    const dir = path.join(__dirname, '../../../public/uploads/courses');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: course-{timestamp}.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `course-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: courseStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for course images
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, and .webp images are allowed.'), false);
    }
  }
});

exports.uploadCourseImage = [
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }

      // Return the public URL path
      const imageUrl = `/uploads/courses/${req.file.filename}`;
      res.json({ 
        success: true, 
        imageUrl,
        filename: req.file.filename 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

// ── Multer storage config for Quiz Documents ──────────────────────
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../public/uploads/documents');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .doc, and .docx files are allowed.'), false);
    }
  }
});

exports.uploadQuizDocument = [
  documentUpload.single('document'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No document file uploaded.' });
      }
      const documentUrl = `/uploads/documents/${req.file.filename}`;
      res.json({ success: true, documentUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
];

