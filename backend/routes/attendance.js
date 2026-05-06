const router = require('express').Router();
const db     = require('../db');
const { protect } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

const today = () => new Date().toISOString().split('T')[0];
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

// GET /api/attendance
router.get('/', protect, scope, async (req, res) => {
  try {
    const { date, month } = req.query;
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ attendance: [] });

    let where = 'WHERE a.user_id = ANY($1)';
    const params = [ids];

    if (date) { where += ` AND a.date = $${params.push(date)}`; }
    else if (month) { where += ` AND TO_CHAR(a.date, 'YYYY-MM') = $${params.push(month)}`; }

    const { rows } = await db.query(
      `SELECT a.*, u.full_name, u.department_id, d.name AS department_name
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       ${where}
       ORDER BY a.date DESC, u.full_name`,
      params
    );
    res.json({ attendance: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/summary
router.get('/summary', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    const { rows } = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'keldi')      AS keldi,
         COUNT(*) FILTER (WHERE status = 'kelmadi')    AS kelmadi,
         COUNT(*) FILTER (WHERE status = 'kech_keldi') AS kech_keldi,
         COUNT(*) AS total
       FROM attendance
       WHERE user_id = ANY($1) AND date = $2`,
      [ids, today()]
    );
    const s = rows[0];
    const pct = s.total > 0 ? Math.round(((+s.keldi + +s.kech_keldi) / +s.total) * 100) : 0;
    res.json({ ...s, percentage: pct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/checkin
router.post('/checkin', protect, async (req, res) => {
  try {
    const time = nowHHMM();
    const [h, m] = time.split(':').map(Number);
    const status = (h > 9 || (h === 9 && m > 0)) ? 'kech_keldi' : 'keldi';

    const { rows } = await db.query(
      `INSERT INTO attendance (user_id, date, check_in, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date) DO UPDATE SET check_in = $3, status = $4
       RETURNING *`,
      [req.user.id, today(), time, status]
    );
    res.json({ attendance: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/attendance/checkout
router.post('/checkout', protect, async (req, res) => {
  try {
    const time = nowHHMM();
    const { rows: existing } = await db.query(
      `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
      [req.user.id, today()]
    );
    if (!existing.length || !existing[0].check_in)
      return res.status(400).json({ message: 'Avval kirish qayd etilmagan' });

    const [ih, im] = existing[0].check_in.split(':').map(Number);
    const [oh, om] = time.split(':').map(Number);
    const workHours = Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 100) / 100;

    const { rows } = await db.query(
      `UPDATE attendance SET check_out = $1, work_hours = $2
       WHERE user_id = $3 AND date = $4 RETURNING *`,
      [time, workHours, req.user.id, today()]
    );
    res.json({ attendance: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/attendance/:id (admin/team_lead)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, check_in, check_out } = req.body;
    const { rows } = await db.query(
      `UPDATE attendance SET
         status    = COALESCE($1, status),
         check_in  = COALESCE($2, check_in),
         check_out = COALESCE($3, check_out)
       WHERE id = $4 RETURNING *`,
      [status, check_in, check_out, req.params.id]
    );
    res.json({ attendance: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
