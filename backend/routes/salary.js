const router = require('express').Router();
const { query, inClause } = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

// GET /api/salary
router.get('/', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ salaries: [] });
    const { clause, params } = inClause(ids);
    const { rows } = await query(
      `SELECT s.*, u.full_name, u.position, d.name AS department_name
       FROM salary_records s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE s.user_id IN ${clause} AND u.role != 'admin'
       ORDER BY s.month DESC, u.full_name`,
      params
    );
    res.json({ salaries: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/salary
router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const { user_id, month, base_salary, bonus = 0, deduction = 0 } = req.body;
    const net = parseFloat(base_salary) + parseFloat(bonus) - parseFloat(deduction);

    // Upsert
    const existing = await query(
      `SELECT id FROM salary_records WHERE user_id = $1 AND month = $2`,
      [user_id, month]
    );
    if (existing.rows.length) {
      await query(
        `UPDATE salary_records SET base_salary=$1, bonus=$2, deduction=$3, net_salary=$4
         WHERE user_id=$5 AND month=$6`,
        [base_salary, bonus, deduction, net, user_id, month]
      );
    } else {
      await query(
        `INSERT INTO salary_records (user_id, month, base_salary, bonus, deduction, net_salary)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id, month, base_salary, bonus, deduction, net]
      );
    }
    const { rows } = await query(
      `SELECT s.*, u.full_name FROM salary_records s JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1 AND s.month = $2`,
      [user_id, month]
    );
    res.status(201).json({ salary: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/salary/:id
router.patch('/:id', protect, allow('admin'), async (req, res) => {
  try {
    const { base_salary, base, bonus, deduction, deductions, status } = req.body;
    const baseVal = base_salary || base;
    const dedVal  = deduction || deductions;

    const { rows: cur } = await query(`SELECT * FROM salary_records WHERE id = $1`, [req.params.id]);
    if (!cur.length) return res.status(404).json({ message: 'Maosh yozuvi topilmadi' });

    const newBase = baseVal !== undefined ? Number(baseVal) : cur[0].base_salary;
    const newBonus = bonus !== undefined ? Number(bonus) : cur[0].bonus;
    const newDed  = dedVal !== undefined ? Number(dedVal) : cur[0].deduction;
    const net     = newBase + newBonus - newDed;

    await query(
      `UPDATE salary_records SET base_salary=$1, bonus=$2, deduction=$3, net_salary=$4,
         status=COALESCE($5, status)
       WHERE id=$6`,
      [newBase, newBonus, newDed, net, status, req.params.id]
    );
    const { rows } = await query(
      `SELECT s.*, u.full_name FROM salary_records s JOIN users u ON s.user_id = u.id WHERE s.id = $1`,
      [req.params.id]
    );
    res.json({ salary: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
