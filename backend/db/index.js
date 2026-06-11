/**
 * db/index.js — SQLite adapter with PostgreSQL-compatible query interface.
 * Simple approach: $N → ?, no ANY() support (routes use IN directly).
 */
const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(__dirname, 'staffflow.db');
const db      = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function query(text, params = []) {
  // Convert $1, $2, ... → ?  (simple sequential replacement)
  const sql   = text.replace(/\$\d+/g, '?');
  const args  = params.map(p => (p === undefined || p === null) ? null : p);
  const upper = sql.trim().toUpperCase();

  try {
    // SELECT / WITH
    if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
      const rows = db.prepare(sql).all(...args);
      return Promise.resolve({ rows });
    }

    // INSERT
    if (upper.startsWith('INSERT')) {
      const cleanSql = sql.replace(/\s+RETURNING\s+[\s\S]*/i, '');
      const info     = db.prepare(cleanSql).run(...args);
      if (/RETURNING/i.test(sql) && info.lastInsertRowid) {
        const tbl = (sql.match(/INSERT\s+INTO\s+(\w+)/i) || [])[1];
        if (tbl) {
          const row = db.prepare(`SELECT * FROM ${tbl} WHERE rowid = ?`).get(info.lastInsertRowid);
          return Promise.resolve({ rows: row ? [row] : [], rowCount: info.changes });
        }
      }
      return Promise.resolve({ rows: [], rowCount: info.changes });
    }

    // UPDATE
    if (upper.startsWith('UPDATE')) {
      const hasRet   = /RETURNING/i.test(sql);
      const cleanSql = sql.replace(/\s+RETURNING\s+[\s\S]*/i, '');
      const info     = db.prepare(cleanSql).run(...args);
      if (hasRet && info.changes > 0) {
        const tbl = (sql.match(/UPDATE\s+(\w+)/i) || [])[1];
        const whr = (cleanSql.match(/WHERE\s+([\s\S]+)$/i) || [])[1];
        if (tbl && whr) {
          const whrCount  = (whr.match(/\?/g) || []).length;
          const whrParams = args.slice(args.length - whrCount);
          try {
            const rows = db.prepare(`SELECT * FROM ${tbl} WHERE ${whr}`).all(...whrParams);
            return Promise.resolve({ rows, rowCount: info.changes });
          } catch { /* fallback */ }
        }
      }
      return Promise.resolve({ rows: [], rowCount: info.changes });
    }

    // DELETE
    if (upper.startsWith('DELETE')) {
      const info = db.prepare(sql.replace(/\s+RETURNING\s+[\s\S]*/i, '')).run(...args);
      return Promise.resolve({ rows: [], rowCount: info.changes });
    }

    // DDL
    db.exec(sql);
    return Promise.resolve({ rows: [] });

  } catch (err) {
    console.error('❌ DB Error:', err.message);
    console.error('   SQL:', sql.substring(0, 300));
    console.error('   Params:', args);
    return Promise.reject(err);
  }
}

/**
 * Helper: build IN clause for array of ids
 * Usage: const { clause, params } = inClause(ids);
 *        db.query(`SELECT * FROM users WHERE id IN ${clause}`, params)
 */
function inClause(arr) {
  if (!arr || !arr.length) return { clause: '(NULL)', params: [] };
  return {
    clause: '(' + arr.map(() => '?').join(',') + ')',
    params: arr,
  };
}

module.exports = { query, db, inClause };
