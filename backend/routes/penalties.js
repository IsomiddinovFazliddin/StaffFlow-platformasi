const router = require('express').Router();
const { query, inClause } = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

// GET /api/penalties
router.get('/', protect, scope, async (req, res) => {
  try {
    const { month, userId } = req.query;
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ penalties: [] });

    const { clause, params } = inClause(ids);
    let where = `WHERE p.user_id IN ${clause} AND u.role != 'admin'`;
    const extra = [...params];

    if (userId) { where += ` AND p.user_id = ?`; extra.push(Number(userId)); }
    if (month)  { where += ` AND p.month = ?`;   extra.push(month); }

    const { rows } = await query(
      `SELECT p.*, u.full_name, u.position
       FROM penalties p JOIN users u ON p.user_id = u.id
       ${where} ORDER BY p.created_at DESC`,
      extra
    );
    res.json({ penalties: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/penalties
router.post('/', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    const { user_id, userId, type, points, reason, month } = req.body;
    const uid   = user_id || userId;
    const today = new Date().toISOString().split('T')[0];
    const mon   = month || today.slice(0, 7);

    const { rows } = await query(
      `INSERT INTO penalties (user_id, type, points, reason, month, date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [uid, type || 'MANUAL', points || -1, reason, mon, today, req.user.id]
    );
    const { rows: empRows } = await query('SELECT full_name, position FROM users WHERE id = $1', [uid]);
    const penalty = rows[0] || { user_id: uid, type, points, reason, month: mon };
    res.status(201).json({ penalty: { ...penalty, full_name: empRows[0]?.full_name, position: empRows[0]?.position } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/penalties/:id
router.patch('/:id', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    const { type, points, reason } = req.body;
    await query(
      `UPDATE penalties SET
         type   = COALESCE($1, type),
         points = COALESCE($2, points),
         reason = COALESCE($3, reason)
       WHERE id = $4`,
      [type, points, reason, req.params.id]
    );
    const { rows } = await query(`SELECT * FROM penalties WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Jarima topilmadi' });
    res.json({ penalty: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/penalties/:id
router.delete('/:id', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    await query('DELETE FROM penalties WHERE id = $1', [req.params.id]);
    res.json({ message: 'Jarima o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
