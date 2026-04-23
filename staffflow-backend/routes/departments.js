const router   = require('express').Router();
const Department = require('../models/Department');
const User       = require('../models/User');
const { protect, allow } = require('../middleware/auth');

// GET /api/departments
router.get('/', protect, async (req, res) => {
  try {
    const depts = await Department.find().populate('managerId', 'name email');
    res.json({ departments: depts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/departments
router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ department: dept });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/departments/:id
router.patch('/:id', protect, allow('admin'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: 'Bo\'lim topilmadi' });
    res.json({ department: dept });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/departments/:id  — unassign employees from deleted dept
router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Bo\'lim topilmadi' });
    // Unassign employees
    await User.updateMany({ departmentId: req.params.id }, { $set: { departmentId: null } });
    res.json({ message: 'Bo\'lim o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
