const jwt = require('jsonwebtoken');
const prisma = require('../models/prismaClient');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    
    try {
      // Check if user is still active in DB
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isActive: true, lastActive: true }
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated.' });
      }

      // Update lastActive timestamp (throttled to once per minute)
      const now = new Date();
      if (!user.lastActive || (now - new Date(user.lastActive)) > 60000) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActive: now }
        });
      }

      req.user = user;
      next();
    } catch (dbError) {
      return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
