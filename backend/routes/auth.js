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
    const { full_name, name, email, password } = req.body;
    const displayName = full_name || name;
    if (!displayName || !email || !password)
      return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart' });

    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length)
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

    const hash = await bcrypt.hash(password, 12);

    // Birinchi foydalanuvchi → admin, qolganlar → pending employee
    const { rows: countRows } = await db.query('SELECT COUNT(*) AS cnt FROM users');
    const isFirst = parseInt(countRows[0]?.cnt || 0) === 0;

    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_approved, provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        displayName.trim(),
        email.toLowerCase(),
        hash,
        isFirst ? 'admin' : 'employee',
        isFirst ? 'active' : 'pending',
        isFirst ? 1 : 0,
        'email',
      ]
    );

    if (isFirst) {
      // Birinchi foydalanuvchi darhol login qila oladi
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      const token = sign(rows[0].id);
      const { password_hash, ...safeUser } = rows[0];
      return res.status(201).json({ token, user: { ...safeUser, name: safeUser.full_name } });
    }

    res.status(201).json({
      message: 'Ro\'yxatdan o\'tdingiz. Admin tasdiqlashini kuting.',
      pending: true,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/google
// mode: 'login'    → faqat mavjud foydalanuvchilar (Login sahifasi)
// mode: 'register' → yangi foydalanuvchi yaratadi (Register sahifasi)
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleUid, mode } = req.body;
    if (!email) return res.status(400).json({ message: 'Email talab qilinadi' });

    const { rows } = await db.query(
      `SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]
    );
    const user = rows[0];

    // Mavjud foydalanuvchi
    if (user) {
      if (user.status === 'pending')
        return res.json({ pending: true });
      if (user.status === 'rejected')
        return res.status(403).json({ message: 'Hisobingiz rad etilgan. Admin bilan bog\'laning.' });
      if (user.status !== 'active' || !user.is_approved)
        return res.json({ pending: true });

      // Active user — token qaytар
      const token = sign(user.id);
      // Department nomini ham olish
      const { rows: fullRows } = await db.query(
        `SELECT u.*, d.name AS department_name
         FROM users u LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.id = $1`, [user.id]
      );
      const fullUser = fullRows[0];
      const { password_hash, ...safeUser } = fullUser;
      return res.json({ token, user: { ...safeUser, name: safeUser.full_name } });
    }

    // Yangi foydalanuvchi
    if (mode === 'login') {
      // Login sahifasida yangi foydalanuvchi yaratilmaydi
      return res.status(404).json({
        message: 'Bu Google akkaunt tizimda ro\'yxatdan o\'tmagan. Avval ro\'yxatdan o\'ting.'
      });
    }

    // Register mode — yangi foydalanuvchi yaratish
    const { rows: countRows } = await db.query('SELECT COUNT(*) AS cnt FROM users');
    const isFirst = parseInt(countRows[0]?.cnt || 0) === 0;

    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        name || email.split('@')[0],
        email.toLowerCase(),
        '',
        isFirst ? 'admin' : 'employee',
        isFirst ? 'active' : 'pending',
        isFirst ? 1 : 0,
      ]
    );

    if (!isFirst) {
      return res.status(201).json({ pending: true });
    }

    const { rows: newRows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const newUser = newRows[0];
    const token = sign(newUser.id);
    const { password_hash, ...safeUser } = newUser;
    return res.status(201).json({ token, user: { ...safeUser, name: safeUser.full_name } });

  } catch (err) {
    console.error('Google auth error:', err.message);
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

    if (user.provider === 'google') {
      return res.status(403).json({ message: 'Bu akkaunt Google orqali ro\'yxatdan o\'tgan. Iltimos, Google bilan kiring.' });
    }

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
