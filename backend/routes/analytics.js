const router = require('express').Router();
const { query, inClause } = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

// GET /api/analytics
router.get('/', protect, allow('admin', 'team_lead'), scope, async (req, res) => {
  try {
    const ids   = req.scopedIds;
    const today = new Date().toISOString().split('T')[0];
    const month = today.slice(0, 7);

    if (!ids.length) {
      return res.json({
        employees:  { total: 0, active: 0 },
        attendance: { today: 0, late: 0, absent: 0, total: 0 },
        tasks:      { total: 0, done: 0, pending: 0, inProgress: 0 },
        salary:     { total: 0, month },
      });
    }

    const { clause, params } = inClause(ids);

    const [empRes, attRes, taskRes, salRes] = await Promise.all([
      query(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active
             FROM users WHERE id IN ${clause} AND role != 'admin'`, params),
      query(`SELECT
               SUM(CASE WHEN status IN ('keldi','kech_keldi') THEN 1 ELSE 0 END) AS present,
               SUM(CASE WHEN status='kech_keldi' THEN 1 ELSE 0 END) AS late,
               SUM(CASE WHEN status='kelmadi' THEN 1 ELSE 0 END) AS absent
             FROM attendance a
             JOIN users u ON a.user_id = u.id
             WHERE a.user_id IN ${clause} AND u.role != 'admin' AND a.date = ?`,
            [...params, today]),
      query(`SELECT
               COUNT(*) AS total,
               SUM(CASE WHEN status='Done' THEN 1 ELSE 0 END) AS done,
               SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
               SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) AS inProgress
             FROM tasks t
             JOIN users u ON t.assigned_to = u.id
             WHERE t.assigned_to IN ${clause} AND u.role != 'admin'`, params),
      query(`SELECT COALESCE(SUM(s.net_salary), 0) AS total
             FROM salary_records s
             JOIN users u ON s.user_id = u.id
             WHERE s.user_id IN ${clause} AND u.role != 'admin' AND substr(s.month,1,7) = ?`,
            [...params, month]),
    ]);

    res.json({
      employees:  { total: empRes.rows[0]?.total || 0, active: empRes.rows[0]?.active || 0 },
      attendance: {
        today:  attRes.rows[0]?.present || 0,
        late:   attRes.rows[0]?.late    || 0,
        absent: attRes.rows[0]?.absent  || 0,
        total:  ids.length,
      },
      tasks: {
        total:      taskRes.rows[0]?.total      || 0,
        done:       taskRes.rows[0]?.done       || 0,
        pending:    taskRes.rows[0]?.pending    || 0,
        inProgress: taskRes.rows[0]?.inProgress || 0,
      },
      salary: { total: salRes.rows[0]?.total || 0, month },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/dashboard (legacy)
router.get('/dashboard', protect, scope, async (req, res) => {
  try {
    const ids   = req.scopedIds;
    const today = new Date().toISOString().split('T')[0];
    if (!ids.length) return res.json({ totalEmployees: 0, attendance: {}, tasks: {} });

    const { clause, params } = inClause(ids);
    const [empRes, attRes, taskRes] = await Promise.all([
      query(`SELECT COUNT(*) AS cnt FROM users WHERE id IN ${clause} AND status='active'`, params),
      query(`SELECT
               SUM(CASE WHEN status='keldi' THEN 1 ELSE 0 END) AS present,
               SUM(CASE WHEN status='kech_keldi' THEN 1 ELSE 0 END) AS late,
               SUM(CASE WHEN status='kelmadi' THEN 1 ELSE 0 END) AS absent
             FROM attendance WHERE user_id IN ${clause} AND date = ?`, [...params, today]),
      query(`SELECT
               SUM(CASE WHEN status='Done' THEN 1 ELSE 0 END) AS done,
               SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) AS in_progress,
               SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending
             FROM tasks WHERE assigned_to IN ${clause}`, params),
    ]);

    res.json({
      totalEmployees: empRes.rows[0]?.cnt || 0,
      attendance: attRes.rows[0] || {},
      tasks: taskRes.rows[0] || {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
