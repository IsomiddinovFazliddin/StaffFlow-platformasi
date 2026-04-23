const router       = require('express').Router();
const Task         = require('../models/Task');
const Notification = require('../models/Notification');
const { protect, allow } = require('../middleware/auth');

// GET /api/tasks  — filtered by role
router.get('/', protect, async (req, res) => {
  try {
    const { role, _id } = req.user;
    let filter = {};
    // Employees only see their own tasks
    if (role === 'employee') filter.assignedTo = _id;
    // Team leads see tasks they assigned or are assigned to them
    else if (role === 'team_lead') filter.$or = [{ assignedTo: _id }, { assignedBy: _id }];
    // Admin/HR see all

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name avatar')
      .populate('assignedBy', 'name')
      .sort('-createdAt');
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks  — create + auto-notify assignee
router.post('/', protect, allow('admin', 'hr_manager', 'team_lead'), async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user._id });

    // Auto-create notification for assignee
    await Notification.create({
      userId:  task.assignedTo,
      content: `Sizga yangi vazifa tayinlandi: "${task.title}"`,
      type:    'Task',
    });

    // Emit real-time event if socket available
    const io = req.app.get('io');
    if (io) io.to(task.assignedTo.toString()).emit('notification', { type: 'Task', title: task.title });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name avatar' },
      { path: 'assignedBy', select: 'name' },
    ]);
    res.status(201).json({ task: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Vazifa topilmadi' });

    // Employees can only update status of their own tasks
    const { role, _id } = req.user;
    if (role === 'employee') {
      if (task.assignedTo.toString() !== _id.toString())
        return res.status(403).json({ message: 'Ruxsat yo\'q' });
      if (req.body.status) task.status = req.body.status;
    } else {
      Object.assign(task, req.body);
    }

    await task.save();
    res.json({ task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, allow('admin', 'hr_manager', 'team_lead'), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vazifa o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
