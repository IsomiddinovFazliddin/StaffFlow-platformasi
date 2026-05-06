const router = require('express').Router();
const db     = require('../db');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT d.*, COUNT(u.id) AS employee_count
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id AND u.status = 'active'
       GROUP BY d.id ORDER BY d.name`
    );
    res.json({ departments: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    const { rows } = await db.query(
      `INSERT INTO departments (name) VALUES ($1) RETURNING *`, [name]
    );
    res.status(201).json({ department: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    await db.query('UPDATE users SET department_id = NULL WHERE department_id = $1', [req.params.id]);
    await db.query('DELETE FROM departments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Bo\'lim o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
