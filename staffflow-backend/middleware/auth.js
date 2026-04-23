const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach req.user
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Token topilmadi' });

  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('departmentId', 'name');
    if (!req.user) return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    next();
  } catch {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};

// Role-based access
exports.allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Ruxsat yo\'q' });
  next();
};

// Alias for semantic clarity
exports.checkRole = exports.allow;
