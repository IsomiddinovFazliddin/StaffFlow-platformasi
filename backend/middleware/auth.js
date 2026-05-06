const jwt  = require('jsonwebtoken');
const db   = require('../db');

exports.protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Token topilmadi' });

  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always re-validate from DB — never trust cached token data
    const { rows } = await db.query(
      `SELECT id, full_name, email, role, department_id, salary, status, is_approved
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    const user = rows[0];
    if (!user)
      return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    if (user.status !== 'active' || !user.is_approved)
      return res.status(401).json({ message: 'Hisobingiz faol emas' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};

exports.allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Ruxsat yo\'q' });
  next();
};
