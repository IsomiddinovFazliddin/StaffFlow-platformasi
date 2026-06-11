/**
 * db/init.js — Create all tables (SQLite)
 * Run: node db/init.js
 */
require('dotenv').config();
const { db } = require('./index');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name     TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT DEFAULT NULL,
      role          TEXT DEFAULT 'employee',
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      provider      TEXT DEFAULT 'email',
      position      TEXT DEFAULT '',
      salary        REAL DEFAULT 0,
      phone         TEXT DEFAULT '',
      status        TEXT DEFAULT 'pending',
      is_approved   INTEGER DEFAULT 0,
      approved_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      check_in   TEXT,
      check_out  TEXT,
      status     TEXT,
      work_hours REAL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT NOT NULL,
      description   TEXT DEFAULT '',
      assigned_to   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      assigned_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      status        TEXT DEFAULT 'Pending',
      priority      TEXT DEFAULT 'Medium',
      due_date      TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS salary_records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      month       TEXT NOT NULL,
      base_salary REAL DEFAULT 0,
      bonus       REAL DEFAULT 0,
      deduction   REAL DEFAULT 0,
      net_salary  REAL DEFAULT 0,
      status      TEXT DEFAULT 'Pending',
      created_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, month)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS penalties (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT DEFAULT 'MANUAL',
      points     INTEGER NOT NULL DEFAULT -1,
      reason     TEXT NOT NULL,
      month      TEXT NOT NULL,
      date       TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type         TEXT DEFAULT 'info',
      title        TEXT,
      message      TEXT,
      is_read      INTEGER DEFAULT 0,
      related_id   INTEGER,
      related_type TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('✅ All tables created successfully (SQLite)');
}

try {
  init();
  process.exit(0);
} catch (err) {
  console.error('❌ Init error:', err.message);
  process.exit(1);
}
