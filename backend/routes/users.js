const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query, inClause } = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

// GET /api/users
router.get('/', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ users: [] });
    const { clause, params } = inClause(ids);
    const { rows } = await query(
      `SELECT u.id, u.full_name AS name, u.email, u.role, u.position,
              u.salary, u.phone, u.status, u.created_at AS joinDate,
              u.department_id AS departmentId, d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id IN ${clause} AND u.status != 'inactive' AND u.role != 'admin'
       ORDER BY u.full_name`,
      params
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.full_name AS name, u.email, u.role, u.position,
              u.salary, u.phone, u.status, u.created_at AS joinDate,
              u.department_id AS departmentId, d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users
router.post('/', protect, allow('admin'), async (req, res) => {
  try {
    const { name, email, password, role, position, departmentId, salary, phone, status, approvalStatus } = req.body;
    const hash       = await bcrypt.hash(password || 'staffflow123', 12);
    const isApproved = approvalStatus === 'approved' || status === 'Active' ? 1 : 0;
    const userStatus = isApproved ? 'active' : 'pending';

    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, role, position, department_id, salary, phone, status, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, full_name AS name, email, role, position, department_id AS departmentId, salary, phone, status`,
      [name, email.toLowerCase(), hash, role || 'employee', position || '',
       departmentId || null, Number(salary) || 0, phone || '', userStatus, isApproved]
    );
    res.status(201).json({ user: rows[0] || { name, email, role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/users/:id
router.patch('/:id', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    const { name, email, phone, salary, status, role, position, departmentId, accountRole } = req.body;
    await query(
      `UPDATE users SET
         full_name     = COALESCE($1, full_name),
         email         = COALESCE($2, email),
         phone         = COALESCE($3, phone),
         salary        = COALESCE($4, salary),
         status        = COALESCE($5, status),
         role          = COALESCE($6, role),
         position      = COALESCE($7, position),
         department_id = COALESCE($8, department_id)
       WHERE id = $9`,
      [name, email, phone, salary !== undefined ? Number(salary) : null,
       status, accountRole || role, position, departmentId || null, req.params.id]
    );
    const { rows } = await query(
      `SELECT u.id, u.full_name AS name, u.email, u.role, u.position,
              u.salary, u.phone, u.status, u.department_id AS departmentId, d.name AS department
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    await query(`UPDATE users SET status = 'inactive' WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
