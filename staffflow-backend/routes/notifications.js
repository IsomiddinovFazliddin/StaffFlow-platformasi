const router       = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/notifications  — own notifications
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(50);
    const unread = notes.filter(n => !n.isRead).length;
    res.json({ notifications: notes, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ message: 'O\'qildi' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'Hammasi o\'qildi' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
