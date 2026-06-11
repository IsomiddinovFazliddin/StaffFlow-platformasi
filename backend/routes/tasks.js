const router = require('express').Router();
const { query, inClause } = require('../db');
const { protect, allow } = require('../middleware/auth');
const scope  = require('../middleware/scopeFilter');

// GET /api/tasks
router.get('/', protect, scope, async (req, res) => {
  try {
    const ids = req.scopedIds;
    if (!ids.length) return res.json({ tasks: [] });
    const { clause, params } = inClause(ids);
    const { rows } = await query(
      `SELECT t.*, u.full_name AS assignee_name, ab.full_name AS assigned_by_name,
              d.name AS department_name
       FROM tasks t
       LEFT JOIN users u  ON t.assigned_to = u.id
       LEFT JOIN users ab ON t.assigned_by = ab.id
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.assigned_to IN ${clause} AND (u.role IS NULL OR u.role != 'admin')
       ORDER BY t.created_at DESC`,
      params
    );
    res.json({ tasks: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, allow('admin', 'team_lead'), async (req, res) => {
  try {
    const { title, description, assigned_to, assignedTo, priority, due_date, dueDate, status } = req.body;
    const assignee = assigned_to || assignedTo;
    const due      = due_date || dueDate;

    const { rows: empRows } = await query('SELECT department_id FROM users WHERE id = $1', [assignee]);
    const deptId = empRows[0]?.department_id || null;

    const { rows } = await query(
      `INSERT INTO tasks (title, description, assigned_to, assigned_by, department_id, priority, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description || '', assignee, req.user.id, deptId,
       priority || 'Medium', due || null, status || 'Pending']
    );

    const task = rows[0] || { title, description, assigned_to: assignee };
    // Enrich with assignee name
    if (task.assigned_to) {
      const { rows: uRows } = await query('SELECT full_name FROM users WHERE id = $1', [task.assigned_to]);
      task.assignee_name = uRows[0]?.full_name || '';
    }
    res.status(201).json({ task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, title, description, priority, due_date, dueDate, assignedTo, assigned_to } = req.body;
    const due      = due_date || dueDate;
    const assignee = assigned_to || assignedTo;

    await query(
      `UPDATE tasks SET
         status      = COALESCE($1, status),
         title       = COALESCE($2, title),
         description = COALESCE($3, description),
         priority    = COALESCE($4, priority),
         due_date    = COALESCE($5, due_date),
         assigned_to = COALESCE($6, assigned_to)
       WHERE id = $7`,
      [status, title, description, priority, due, assignee || null, req.params.id]
    );
    const { rows } = await query(
      `SELECT t.*, u.full_name AS assignee_name
       FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [req.params.id]
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
    await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vazifa o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
