const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register  (Admin only — seed or first-run)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email allaqachon mavjud' });
    const user  = await User.create({ name, email, password, role: role || 'employee' });
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email va parol kiritilishi shart' });

    const user = await User.findOne({ email }).select('+password').populate('departmentId', 'name');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });

    const token = signToken(user._id);
    // Return token + role + user for frontend RBAC routing
    res.json({
      token,
      role: user.role,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        departmentId: user.departmentId,
        position:     user.position,
        avatar:       user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  — dynamic profile from JWT
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me  — update own profile
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .populate('departmentId', 'name');
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Joriy parol noto\'g\'ri' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
