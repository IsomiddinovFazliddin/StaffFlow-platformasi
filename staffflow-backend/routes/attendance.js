const router     = require('express').Router();
const Attendance = require('../models/Attendance');
const { protect, allow } = require('../middleware/auth');

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTime  = () => new Date().toTimeString().slice(0, 5); // 'HH:MM'

// Calculate total hours between two 'HH:MM' strings
const calcHours = (inT, outT) => {
  const [ih, im] = inT.split(':').map(Number);
  const [oh, om] = outT.split(':').map(Number);
  const diff = (oh * 60 + om) - (ih * 60 + im);
  return diff > 0 ? Math.round((diff / 60) * 100) / 100 : 0;
};

// GET /api/attendance  — Admin/HR: all, Employee: own
router.get('/', protect, async (req, res) => {
  try {
    const { date, userId } = req.query;
    const filter = {};
    if (req.user.role === 'employee') filter.userId = req.user._id;
    else if (userId) filter.userId = userId;
    if (date) filter.date = date;

    const records = await Attendance.find(filter)
      .populate('userId', 'name avatar departmentId')
      .sort('-date');
    res.json({ attendance: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/checkin
router.post('/checkin', protect, async (req, res) => {
  try {
    const date    = todayStr();
    const checkIn = nowTime();
    // 'Late' if after 09:00
    const [h, m]  = checkIn.split(':').map(Number);
    const status  = (h > 9 || (h === 9 && m > 0)) ? 'Late' : 'On Time';

    const record = await Attendance.findOneAndUpdate(
      { userId: req.user._id, date },
      { checkIn, status },
      { upsert: true, new: true }
    ).populate('userId', 'name');

    res.json({ attendance: record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/attendance/checkout
router.post('/checkout', protect, async (req, res) => {
  try {
    const date     = todayStr();
    const checkOut = nowTime();
    const record   = await Attendance.findOne({ userId: req.user._id, date });
    if (!record || !record.checkIn)
      return res.status(400).json({ message: 'Avval kirish qayd etilmagan' });

    record.checkOut   = checkOut;
    record.totalHours = calcHours(record.checkIn, checkOut);
    await record.save();
    res.json({ attendance: record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/attendance/:id  — Admin/HR manual update
router.patch('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ attendance: record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
