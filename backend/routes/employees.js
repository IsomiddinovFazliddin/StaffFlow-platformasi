const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope   = require('../middleware/scopeFilter');

// GET /api/employees
router.get('/', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ employees: [] });

    const { rows } = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.position, u.salary,
              u.phone, u.status, u.created_at, d.name AS department_name, u.department_id
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ANY($1) AND u.status = 'active'
       ORDER BY u.full_name`,
      [ids]
    );
    res.json({ employees: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/my-team
router.get('/my-team', protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.position, u.department_id,
              d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.department_id = $1 AND u.status = 'active' AND u.id != $2`,
      [req.user.department_id, req.user.id]
    );
    res.json({ team: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees (admin only)
router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const { full_name, email, password, role, department_id, salary, position, phone } = req.body;
    const hash = await bcrypt.hash(password || 'changeme123', 12);
    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, department_id, salary, position, phone, status, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', true)
       RETURNING id, full_name, email, role, department_id, salary, position, phone, status`,
      [full_name, email.toLowerCase(), hash, role || 'employee', department_id || null, salary || 0, position || '', phone || '']
    );
    res.status(201).json({ employee: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/employees/:id (admin only)
router.put('/:id', protect, allow('admin'), async (req, res) => {
  try {
    const { full_name, role, department_id, salary, position, phone } = req.body;
    const { rows } = await db.query(
      `UPDATE users SET
         full_name     = COALESCE($1, full_name),
         role          = COALESCE($2, role),
         department_id = COALESCE($3, department_id),
         salary        = COALESCE($4, salary),
         position      = COALESCE($5, position),
         phone         = COALESCE($6, phone)
       WHERE id = $7
       RETURNING id, full_name, email, role, department_id, salary, position, phone`,
      [full_name, role, department_id, salary, position, phone, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Xodim topilmadi' });
    res.json({ employee: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/employees/:id (admin only — soft delete)
router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    await db.query(`UPDATE users SET status = 'inactive' WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Xodim o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
