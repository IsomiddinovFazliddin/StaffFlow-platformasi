/**
 * seed.js — Populate MongoDB with initial StaffFlow data
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose   = require('mongoose');
const User       = require('./models/User');
const Department = require('./models/Department');
const Task       = require('./models/Task');
const Attendance = require('./models/Attendance');
const Salary     = require('./models/Salary');

const today = new Date().toISOString().split('T')[0];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany(), Department.deleteMany(),
    Task.deleteMany(), Attendance.deleteMany(), Salary.deleteMany(),
  ]);
  console.log('Cleared existing data');

  // ── Departments ────────────────────────────────────────────────────────────
  const [eng, design, hr, product] = await Department.insertMany([
    { name: 'Engineering',  description: 'Software development team' },
    { name: 'Design',       description: 'UI/UX design team' },
    { name: 'HR',           description: 'Human resources' },
    { name: 'Product',      description: 'Product management' },
  ]);

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User', email: 'admin@staffflow.com',
    password: 'admin123', role: 'admin',
  });

  const hrManager = await User.create({
    name: 'Carol White', email: 'carol@staffflow.com',
    password: 'hr123', role: 'hr_manager', departmentId: hr._id, position: 'HR Manager',
  });

  // manager@gmail.com — as requested
  const manager = await User.create({
    name: 'Manager User', email: 'manager@gmail.com',
    password: 'manager123', role: 'hr_manager', departmentId: hr._id, position: 'HR Manager',
  });

  const teamLead = await User.create({
    name: 'David Lee', email: 'david@staffflow.com',
    password: 'lead123', role: 'team_lead', departmentId: eng._id, position: 'Backend Developer',
    salary: 6180,
  });

  const alice = await User.create({
    name: 'Alice Johnson', email: 'alice@staffflow.com',
    password: 'emp123', role: 'employee', departmentId: eng._id,
    position: 'Frontend Developer', salary: 5800, phone: '+998 90 111 22 33',
  });

  const bob = await User.create({
    name: 'Bob Smith', email: 'bob@staffflow.com',
    password: 'emp123', role: 'employee', departmentId: design._id,
    position: 'UI/UX Designer', salary: 5150, phone: '+998 90 222 33 44',
  });

  const eva = await User.create({
    name: 'Eva Martinez', email: 'eva@staffflow.com',
    password: 'emp123', role: 'employee', departmentId: product._id,
    position: 'Product Manager', salary: 6450, phone: '+998 90 555 66 77',
  });

  // Set department managers
  await Department.findByIdAndUpdate(hr._id,      { managerId: hrManager._id });
  await Department.findByIdAndUpdate(eng._id,     { managerId: teamLead._id });
  await Department.findByIdAndUpdate(product._id, { managerId: eva._id });

  // ── Tasks ──────────────────────────────────────────────────────────────────
  await Task.insertMany([
    {
      title: 'Design new onboarding flow',
      description: 'Create wireframes and prototypes for the new user onboarding experience.',
      assignedTo: bob._id, assignedBy: teamLead._id,
      priority: 'High', status: 'In Progress',
      deadline: new Date('2026-04-01'),
    },
    {
      title: 'Fix login bug',
      description: 'Investigate and fix the authentication bug reported by QA team.',
      assignedTo: alice._id, assignedBy: teamLead._id,
      priority: 'High', status: 'Done',
      deadline: new Date('2026-03-20'),
    },
    {
      title: 'API integration for payroll',
      description: 'Integrate the payroll calculation API with the backend service.',
      assignedTo: teamLead._id, assignedBy: admin._id,
      priority: 'High', status: 'Pending',
      deadline: new Date('2026-04-15'),
    },
    {
      title: 'User research interviews',
      description: 'Conduct 10 user interviews for the new product feature research.',
      assignedTo: eva._id, assignedBy: hrManager._id,
      priority: 'Low', status: 'In Progress',
      deadline: new Date('2026-04-05'),
    },
  ]);

  // ── Attendance ─────────────────────────────────────────────────────────────
  await Attendance.insertMany([
    { userId: alice._id,    date: today, checkIn: '09:02', checkOut: '18:05', totalHours: 9.05, status: 'On Time' },
    { userId: bob._id,      date: today, checkIn: '09:45', checkOut: '18:30', totalHours: 8.75, status: 'Late' },
    { userId: teamLead._id, date: today, checkIn: null,    checkOut: null,    totalHours: 0,    status: 'Absent' },
    { userId: eva._id,      date: today, checkIn: '08:55', checkOut: '17:58', totalHours: 9.05, status: 'On Time' },
  ]);

  // ── Salaries ───────────────────────────────────────────────────────────────
  const month = '2026-03';
  await Salary.insertMany([
    { userId: alice._id,    month, base: 5500, bonus: 500, deductions: 200, status: 'Paid' },
    { userId: bob._id,      month, base: 5000, bonus: 300, deductions: 150, status: 'Paid' },
    { userId: hrManager._id,month, base: 5200, bonus: 400, deductions: 180, status: 'Paid' },
    { userId: teamLead._id, month, base: 5800, bonus: 600, deductions: 220, status: 'Pending' },
    { userId: eva._id,      month, base: 6000, bonus: 700, deductions: 250, status: 'Paid' },
  ]);

  console.log('✅ Seed completed successfully');
  console.log('\nDemo accounts:');
  console.log('  admin@staffflow.com   / admin123  (Admin)');
  console.log('  carol@staffflow.com   / hr123     (HR Manager)');
  console.log('  manager@gmail.com     / manager123 (HR Manager)');
  console.log('  david@staffflow.com   / lead123   (Team Lead)');
  console.log('  alice@staffflow.com   / emp123    (Employee)');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
