const router = require('express').Router();
const db     = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

// GET /api/tasks
router.get('/', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    const { rows } = await db.query(
      `SELECT t.*, u.full_name AS assignee_name, ab.full_name AS assigned_by_name,
              d.name AS department_name
       FROM tasks t
       LEFT JOIN users u  ON t.assigned_to = u.id
       LEFT JOIN users ab ON t.assigned_by = ab.id
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.assigned_to = ANY($1)
       ORDER BY t.created_at DESC`,
      [ids]
    );
    res.json({ tasks: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, allow('admin', 'team_lead'), scope, async (req, res) => {
  try {
    const { title, description, assigned_to, priority, due_date } = req.body;

    // Validate: assigned_to must be in scoped IDs
    if (!req.scopedIds.includes(Number(assigned_to)))
      return res.status(403).json({ message: 'Bu xodimga vazifa tayinlash ruxsati yo\'q' });

    const { rows: empRows } = await db.query('SELECT department_id FROM users WHERE id = $1', [assigned_to]);
    const deptId = empRows[0]?.department_id;

    const { rows } = await db.query(
      `INSERT INTO tasks (title, description, assigned_to, assigned_by, department_id, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description || '', assigned_to, req.user.id, deptId, priority || 'medium', due_date || null]
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, title, description, priority, due_date } = req.body;
    const { rows } = await db.query(
      `UPDATE tasks SET
         status      = COALESCE($1, status),
         title       = COALESCE($2, title),
         description = COALESCE($3, description),
         priority    = COALESCE($4, priority),
         due_date    = COALESCE($5, due_date)
       WHERE id = $6 RETURNING *`,
      [status, title, description, priority, due_date, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Vazifa topilmadi' });
    res.json({ task: rows[0] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vazifa o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
