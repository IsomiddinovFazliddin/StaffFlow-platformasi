const router = require('express').Router();
const db     = require('../db');
const { protect, allow } = require('../middleware/auth');

// GET /api/admin/approvals/pending
router.get('/pending', protect, allow('admin'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, full_name, email, role, status, created_at
       FROM users WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json({ pending: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/approvals/approve/:id
router.post('/approve/:id', protect, allow('admin'), async (req, res) => {
  try {
    const { department_id, role, salary } = req.body;
    if (!department_id) return res.status(400).json({ message: 'Bo\'lim tanlash majburiy' });

    const { rows } = await db.query(
      `UPDATE users SET
         status = 'active', is_approved = true,
         department_id = $1, role = $2, salary = $3, approved_by = $4
       WHERE id = $5
       RETURNING id, full_name, email, role, department_id, status`,
      [department_id, role || 'employee', salary || 0, req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ user: rows[0], message: 'Foydalanuvchi tasdiqlandi' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/admin/approvals/reject/:id
router.post('/reject/:id', protect, allow('admin'), async (req, res) => {
  try {
    await db.query(`UPDATE users SET status = 'rejected' WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Foydalanuvchi rad etildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
