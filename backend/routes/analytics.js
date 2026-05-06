const router = require('express').Router();
const db     = require('../db');
const { protect } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

router.get('/dashboard', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    const today = new Date().toISOString().split('T')[0];

    const [empRes, attRes, taskRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users WHERE id = ANY($1) AND status='active'`, [ids]),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status='keldi')      AS present,
           COUNT(*) FILTER (WHERE status='kech_keldi') AS late,
           COUNT(*) FILTER (WHERE status='kelmadi')    AS absent
         FROM attendance WHERE user_id = ANY($1) AND date = $2`,
        [ids, today]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status='done')        AS done,
           COUNT(*) FILTER (WHERE status='in_progress') AS in_progress,
           COUNT(*) FILTER (WHERE status='pending')     AS pending
         FROM tasks WHERE assigned_to = ANY($1)`,
        [ids]
      ),
    ]);

    res.json({
      totalEmployees: parseInt(empRes.rows[0].count),
      attendance: attRes.rows[0],
      tasks: taskRes.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
