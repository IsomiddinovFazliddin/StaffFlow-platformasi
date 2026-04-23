const router  = require('express').Router();
const Vacancy = require('../models/Vacancy');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const vacancies = await Vacancy.find()
      .populate('departmentId', 'name')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json({ vacancies });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const vacancy = await Vacancy.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ vacancy });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vacancy) return res.status(404).json({ message: 'Vakansiya topilmadi' });
    res.json({ vacancy });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, allow('admin', 'hr_manager'), async (req, res) => {
  try {
    await Vacancy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vakansiya o\'chirildi' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
