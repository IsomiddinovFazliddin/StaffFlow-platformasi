const router    = require('express').Router();
const Interview = require('../models/Interview');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('vacancyId', 'title')
      .populate('interviewerId', 'name')
      .sort('date');
    res.json({ interviews });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const interview = await Interview.create({ ...req.body, interviewerId: req.user._id });
    res.status(201).json({ interview });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ message: 'Intervyu topilmadi' });
    res.json({ interview });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Intervyu o\'chirildi' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
