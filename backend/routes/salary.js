const router = require('express').Router();
const db     = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

router.get('/', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    const { rows } = await db.query(
      `SELECT s.*, u.full_name, u.position, d.name AS department_name
       FROM salary_records s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE s.user_id = ANY($1)
       ORDER BY s.month DESC, u.full_name`,
      [ids]
    );
    res.json({ salaries: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const { user_id, month, base_salary, bonus = 0, deduction = 0 } = req.body;
    const net = parseFloat(base_salary) + parseFloat(bonus) - parseFloat(deduction);
    const { rows } = await db.query(
      `INSERT INTO salary_records (user_id, month, base_salary, bonus, deduction, net_salary)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, month) DO UPDATE
         SET base_salary = $3, bonus = $4, deduction = $5, net_salary = $6
       RETURNING *`,
      [user_id, month, base_salary, bonus, deduction, net]
    );
    res.status(201).json({ salary: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
