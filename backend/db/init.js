/**
 * db/init.js — Create all tables
 * Run: node db/init.js
 */
require('dotenv').config();
const db = require('./index');

async function init() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      full_name     VARCHAR(255) NOT NULL,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(50)  DEFAULT 'employee',
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      position      VARCHAR(255) DEFAULT '',
      salary        DECIMAL(10,2) DEFAULT 0,
      phone         VARCHAR(50)  DEFAULT '',
      status        VARCHAR(50)  DEFAULT 'pending',
      is_approved   BOOLEAN      DEFAULT false,
      approved_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at    TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date       DATE NOT NULL,
      check_in   TIME,
      check_out  TIME,
      status     VARCHAR(50),
      work_hours DECIMAL(4,2),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, date)
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id            SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      description   TEXT DEFAULT '',
      assigned_to   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      assigned_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      status        VARCHAR(50) DEFAULT 'pending',
      priority      VARCHAR(50) DEFAULT 'medium',
      due_date      DATE,
      created_at    TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS salary_records (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      month       VARCHAR(7) NOT NULL,
      base_salary DECIMAL(10,2) DEFAULT 0,
      bonus       DECIMAL(10,2) DEFAULT 0,
      deduction   DECIMAL(10,2) DEFAULT 0,
      net_salary  DECIMAL(10,2) DEFAULT 0,
      status      VARCHAR(50) DEFAULT 'pending',
      created_at  TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, month)
    );
  `);

  console.log('✅ All tables created successfully');
  process.exit(0);
}

init().catch(err => { console.error(err); process.exit(1); });
