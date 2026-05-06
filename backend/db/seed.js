/**
 * db/seed.js — Seed initial data
 * Run: node db/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./index');

async function seed() {
  // Departments
  const depts = await db.query(`
    INSERT INTO departments (name) VALUES
      ('Engineering'), ('Design'), ('HR'), ('Marketing'), ('Finance')
    ON CONFLICT (name) DO NOTHING
    RETURNING id, name
  `);
  console.log('Departments:', depts.rows.map(d => d.name));

  const engId = (await db.query(`SELECT id FROM departments WHERE name='Engineering'`)).rows[0]?.id;
  const hrId  = (await db.query(`SELECT id FROM departments WHERE name='HR'`)).rows[0]?.id;

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  await db.query(`
    INSERT INTO users (full_name, email, password_hash, role, status, is_approved)
    VALUES ('Admin User', 'admin@staffflow.com', $1, 'admin', 'active', true)
    ON CONFLICT (email) DO NOTHING
  `, [adminHash]);

  // Team Lead
  const leadHash = await bcrypt.hash('lead123', 12);
  await db.query(`
    INSERT INTO users (full_name, email, password_hash, role, department_id, status, is_approved)
    VALUES ('David Lee', 'david@staffflow.com', $1, 'team_lead', $2, 'active', true)
    ON CONFLICT (email) DO NOTHING
  `, [leadHash, engId]);

  // Employee
  const empHash = await bcrypt.hash('emp123', 12);
  await db.query(`
    INSERT INTO users (full_name, email, password_hash, role, department_id, salary, status, is_approved)
    VALUES ('Alice Johnson', 'alice@staffflow.com', $1, 'employee', $2, 5800, 'active', true)
    ON CONFLICT (email) DO NOTHING
  `, [empHash, engId]);

  console.log('✅ Seed completed');
  console.log('  admin@staffflow.com / admin123');
  console.log('  david@staffflow.com / lead123');
  console.log('  alice@staffflow.com / emp123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
