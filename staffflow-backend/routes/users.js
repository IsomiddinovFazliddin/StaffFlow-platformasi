const router = require('express').Router();
const User   = require('../models/User');
const Task   = require('../models/Task');
const { protect, allow } = require('../middleware/auth');

const MANAGERS = ['admin', 'hr_manager', 'team_lead'];

// GET /api/users  — Admin/HR: all users
router.get('/', protect, allow(...MANAGERS), async (req, res) => {
  try {
    const { role, department, status } = req.query;
    const filter = {};
    if (role)       filter.role         = role;
    if (department) filter.departmentId = department;
    if (status)     filter.status       = status;
    const users = await User.find(filter).populate('departmentId', 'name').sort('name');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users  — Admin creates a user
router.post('/', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const { role, departmentId } = req.body;
    // Validation: team_lead and employee must have a department
    if (['team_lead', 'employee'].includes(role) && !departmentId) {
      return res.status(400).json({ message: 'Team Lead va Xodim uchun bo\'lim tanlash majburiy' });
    }
    // Validate department exists if provided
    if (departmentId) {
      const dept = await require('../models/Department').findById(departmentId);
      if (!dept) return res.status(400).json({ message: 'Tanlangan bo\'lim mavjud emas' });
    }
    const user = await User.create(req.body);
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('departmentId', 'name');
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id  — Admin/HR updates user
router.patch('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('departmentId', 'name');
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/users/assign-role  — Admin only
router.post('/assign-role', protect, allow('admin'), async (req, res) => {
  try {
    const { userId, role } = req.body;
    const validRoles = ['admin', 'hr_manager', 'team_lead', 'employee'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: `Rol noto'g'ri. Mumkin bo'lgan rollar: ${validRoles.join(', ')}` });

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name');

    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ message: `Rol muvaffaqiyatli o'zgartirildi: ${role}`, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/users/:id  — Admin only
router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    // Data integrity: remove from active tasks
    await Task.updateMany(
      { assignedTo: req.params.id },
      { $set: { status: 'Pending', assignedTo: null } }
    );
    res.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
