const router = require('express').Router();
const db     = require('../db');
const { protect, allow } = require('../middleware/auth');

// GET /api/approvals/pending
router.get('/pending', protect, allow('admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, full_name AS name, email, role, status, created_at AS "createdAt"
       FROM users WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json({ pending: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/approvals/pending-count
router.get('/pending-count', protect, allow('admin'), async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT COUNT(*) FROM users WHERE status = 'pending'`);
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/approvals/:id/approve
router.put('/:id/approve', protect, allow('admin'), async (req, res) => {
  try {
    const { role, departmentId, salary } = req.body;
    if (!departmentId) return res.status(400).json({ message: 'Bo\'lim tanlash majburiy' });

    const { rows } = await db.query(
      `UPDATE users SET
         status = 'active', is_approved = true,
         department_id = $1, role = $2,
         salary = COALESCE($3, salary),
         approved_by = $4
       WHERE id = $5
       RETURNING id, full_name AS name, email, role, department_id AS "departmentId", status`,
      [departmentId, role || 'employee', salary || null, req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM users WHERE status = 'pending'`);
    res.json({ user: rows[0], pendingCount: parseInt(countRows[0].count) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/approvals/:id/reject
router.put('/:id/reject', protect, allow('admin'), async (req, res) => {
  try {
    await db.query(`UPDATE users SET status = 'rejected' WHERE id = $1`, [req.params.id]);
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM users WHERE status = 'pending'`);
    res.json({ message: 'Foydalanuvchi rad etildi', pendingCount: parseInt(countRows[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Legacy POST endpoints (backward compat)
router.post('/approve/:id', protect, allow('admin'), async (req, res) => {
  req.params.id = req.params.id;
  const { department_id, departmentId, role, salary } = req.body;
  const deptId = departmentId || department_id;
  if (!deptId) return res.status(400).json({ message: 'Bo\'lim tanlash majburiy' });

  try {
    const { rows } = await db.query(
      `UPDATE users SET status = 'active', is_approved = true,
         department_id = $1, role = $2, salary = COALESCE($3, salary), approved_by = $4
       WHERE id = $5
       RETURNING id, full_name AS name, email, role, department_id AS "departmentId", status`,
      [deptId, role || 'employee', salary || null, req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM users WHERE status = 'pending'`);
    res.json({ user: rows[0], pendingCount: parseInt(countRows[0].count) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/reject/:id', protect, allow('admin'), async (req, res) => {
  try {
    await db.query(`UPDATE users SET status = 'rejected' WHERE id = $1`, [req.params.id]);
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM users WHERE status = 'pending'`);
    res.json({ message: 'Foydalanuvchi rad etildi', pendingCount: parseInt(countRows[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
