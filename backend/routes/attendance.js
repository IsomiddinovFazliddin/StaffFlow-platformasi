const router = require('express').Router();
const { query, inClause } = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

const today   = () => new Date().toISOString().split('T')[0];
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

// GET /api/attendance
router.get('/', protect, scope, async (req, res) => {
  try {
    const { date, month } = req.query;
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ attendance: [] });

    const { clause, params } = inClause(ids);
    let where = `WHERE a.user_id IN ${clause} AND u.role != 'admin'`;
    const extraParams = [...params];

    if (date) {
      where += ` AND a.date = ?`;
      extraParams.push(date);
    } else if (month) {
      where += ` AND substr(a.date, 1, 7) = ?`;
      extraParams.push(month);
    }

    const { rows } = await query(
      `SELECT a.*, u.full_name, u.department_id, d.name AS department_name
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       ${where}
       ORDER BY a.date DESC, u.full_name`,
      extraParams
    );
    res.json({ attendance: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/checkin
router.post('/checkin', protect, async (req, res) => {
  try {
    const time   = nowHHMM();
    const date   = today();
    const [h, m] = time.split(':').map(Number);
    const status = (h > 9 || (h === 9 && m > 0)) ? 'kech_keldi' : 'keldi';

    // Upsert
    const existing = await query(
      `SELECT id FROM attendance WHERE user_id = $1 AND date = $2`,
      [req.user.id, date]
    );
    if (existing.rows.length) {
      await query(
        `UPDATE attendance SET check_in = $1, status = $2 WHERE user_id = $3 AND date = $4`,
        [time, status, req.user.id, date]
      );
    } else {
      await query(
        `INSERT INTO attendance (user_id, date, check_in, status) VALUES ($1, $2, $3, $4)`,
        [req.user.id, date, time, status]
      );
    }
    const { rows } = await query(
      `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
      [req.user.id, date]
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
    const date = today();
    const { rows: existing } = await query(
      `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
      [req.user.id, date]
    );
    if (!existing.length || !existing[0].check_in)
      return res.status(400).json({ message: 'Avval kirish qayd etilmagan' });

    const [ih, im] = existing[0].check_in.split(':').map(Number);
    const [oh, om] = time.split(':').map(Number);
    const workHours = Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 100) / 100;

    await query(
      `UPDATE attendance SET check_out = $1, work_hours = $2 WHERE user_id = $3 AND date = $4`,
      [time, workHours, req.user.id, date]
    );
    const { rows } = await query(
      `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
      [req.user.id, date]
    );
    res.json({ attendance: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/attendance/:id
router.patch('/:id', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    const { status, check_in, check_out } = req.body;
    await query(
      `UPDATE attendance SET
         status    = COALESCE($1, status),
         check_in  = COALESCE($2, check_in),
         check_out = COALESCE($3, check_out)
       WHERE id = $4`,
      [status, check_in, check_out, req.params.id]
    );
    const { rows } = await query(`SELECT * FROM attendance WHERE id = $1`, [req.params.id]);
    res.json({ attendance: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
