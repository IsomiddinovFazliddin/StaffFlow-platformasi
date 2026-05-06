const db = require('../db');

async function getScopedEmployeeIds(userId, role, departmentId) {
  if (role === 'admin') {
    const { rows } = await db.query(
      `SELECT id FROM users WHERE status = 'active'`
    );
    return rows.map(r => r.id);
  }
  if (role === 'team_lead') {
    const { rows } = await db.query(
      `SELECT id FROM users WHERE department_id = $1 AND status = 'active'`,
      [departmentId]
    );
    return rows.map(r => r.id);
  }
  // employee — only themselves
  return [userId];
}

module.exports = getScopedEmployeeIds;
