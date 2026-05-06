const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password)
      return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart' });

    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length)
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

    const hash = await bcrypt.hash(password, 12);

    // Check if first user — auto-approve as admin
    const count = await db.query('SELECT COUNT(*) FROM users');
    const isFirst = parseInt(count.rows[0].count) === 0;

    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role, status`,
      [
        full_name.trim(), email.toLowerCase(), hash,
        isFirst ? 'admin' : 'employee',
        isFirst ? 'active' : 'pending',
        isFirst,
      ]
    );

    if (isFirst) {
      const token = sign(rows[0].id);
      return res.status(201).json({ token, user: rows[0] });
    }

    res.status(201).json({
      message: 'Ro\'yxatdan o\'tdingiz. Admin tasdiqlashini kuting.',
      pending: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email va parol kiritilishi shart' });

    const { rows } = await db.query(
      `SELECT u.*, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user)
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });
    if (user.status === 'pending')
      return res.status(401).json({ message: 'Hisobingiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.' });
    if (user.status === 'rejected')
      return res.status(401).json({ message: 'Hisobingiz rad etilgan. Admin bilan bog\'laning.' });
    if (user.status !== 'active' || !user.is_approved)
      return res.status(401).json({ message: 'Hisobingiz faol emas.' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });

    const token = sign(user.id);
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.department_id, u.salary,
            u.phone, u.position, u.status, u.created_at, d.name AS department_name
     FROM users u LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = $1`,
    [req.user.id]
  );
  res.json({ user: rows[0] });
});

// PATCH /api/auth/me
router.patch('/me', protect, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const { rows } = await db.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone)
       WHERE id = $3 RETURNING id, full_name, email, role, phone`,
      [full_name, phone, req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) return res.status(400).json({ message: 'Joriy parol noto\'g\'ri' });
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
