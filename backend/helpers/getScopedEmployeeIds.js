const { db } = require('../db');

/**
 * Admin role = tizim boshqaruvchisi, u HECH QACHON xodim sifatida ko'rinmaydi.
 * Barcha xodim so'rovlarida admin chiqarib tashlanadi.
 */
async function getScopedEmployeeIds(userId, role, departmentId) {
  if (role === 'admin') {
    // Admin barcha xodimlarni ko'radi, lekin o'zi ko'rinmaydi
    const rows = db.prepare(
      `SELECT id FROM users WHERE status = 'active' AND role != 'admin'`
    ).all();
    return rows.map(r => r.id);
  }
  if (role === 'team_lead') {
    const rows = db.prepare(
      `SELECT id FROM users WHERE department_id = ? AND status = 'active' AND role != 'admin'`
    ).all(departmentId);
    return rows.map(r => r.id);
  }
  // employee — faqat o'zi
  return [userId];
}

module.exports = getScopedEmployeeIds;
