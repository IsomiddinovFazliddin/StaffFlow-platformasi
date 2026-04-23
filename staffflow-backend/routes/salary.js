const router = require('express').Router();
const Salary = require('../models/Salary');
const { protect, allow } = require('../middleware/auth');

// GET /api/salary  — Admin/HR: all, Employee: own
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') filter.userId = req.user._id;
    const records = await Salary.find(filter)
      .populate('userId', 'name position departmentId')
      .sort('-month');
    res.json({ salaries: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/salary  — Admin/HR creates salary record
router.post('/', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const salary = await Salary.create(req.body);
    res.status(201).json({ salary });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/salary/:id
router.patch('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Maosh yozuvi topilmadi' });
    Object.assign(salary, req.body);
    await salary.save(); // triggers net recalculation
    res.json({ salary });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
