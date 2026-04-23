import { createContext, useContext, useState, useMemo } from 'react';
import {
  employees as empData,
  tasks as taskData,
  attendance as attendanceData,
  salaries as salaryData,
  activityLogs as logsData,
} from '../utils/mockData';
import { KEYS, loadOrDefault, persist } from '../utils/storage';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayDate = () => new Date().toISOString().split('T')[0];
const currentMonth = () =>
  new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });

/**
 * Given the canonical employees list, rebuild attendance and salary arrays:
 * - Keep existing records that still have a matching employee
 * - Add missing records for new employees
 * - Drop records whose employee no longer exists
 */
function syncAttendance(employees, existing) {
  const empIds = new Set(employees.map(e => e.id));
  // Remove orphaned records
  const kept = existing.filter(a => empIds.has(a.employeeId));
  const keptIds = new Set(kept.map(a => a.employeeId));
  // Add missing
  const added = employees
    .filter(e => !keptIds.has(e.id))
    .map(e => ({
      id: e.id * 10 + 1,
      employeeId: e.id,
      name: e.name,
      date: todayDate(),
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      late: false,
      workHours: 0,
    }));
  return [...kept, ...added];
}

function syncSalaries(employees, existing) {
  const empIds = new Set(employees.map(e => e.id));
  const kept = existing.filter(s => empIds.has(s.employeeId));
  const keptIds = new Set(kept.map(s => s.employeeId));
  const added = employees
    .filter(e => !keptIds.has(e.id))
    .map(e => {
      const base = Number(e.salary) || 0;
      return {
        id: e.id * 10 + 2,
        employeeId: e.id,
        name: e.name,
        role: e.role,
        base,
        bonus: 0,
        deductions: 0,
        net: base,
        month: currentMonth(),
        status: 'Pending',
      };
    });
  return [...kept, ...added];
}

// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const { updateAuth } = useAuth();
  // Load employees first — they are the source of truth
  const [employees, setEmployees] = useState(() => loadOrDefault(KEYS.EMPLOYEES, empData));
  const [tasks,        setTasks]        = useState(() => loadOrDefault(KEYS.TASKS,     taskData));
  const [activityLogs, setActivityLogs] = useState(() => loadOrDefault(KEYS.ACTIVITY,  logsData));

  // Attendance & salaries are derived from employees on first load,
  // then kept in sync on every mutation.
  const [attendance, setAttendance] = useState(() => {
    const stored = loadOrDefault(KEYS.ATTENDANCE, attendanceData);
    const emps   = loadOrDefault(KEYS.EMPLOYEES,  empData);
    return syncAttendance(emps, stored);
  });
  const [salaries, setSalaries] = useState(() => {
    const stored = loadOrDefault(KEYS.SALARIES, salaryData);
    const emps   = loadOrDefault(KEYS.EMPLOYEES, empData);
    return syncSalaries(emps, stored);
  });

  // ── persist helpers ────────────────────────────────────────────────────────
  const setAndPersist = (setter, key) => (updater) => {
    setter(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(key, next);
      return next;
    });
  };

  const setEmp  = setAndPersist(setEmployees,    KEYS.EMPLOYEES);
  const setTask = setAndPersist(setTasks,         KEYS.TASKS);
  const setAtt  = setAndPersist(setAttendance,    KEYS.ATTENDANCE);
  const setSal  = setAndPersist(setSalaries,      KEYS.SALARIES);
  const setLog  = setAndPersist(setActivityLogs,  KEYS.ACTIVITY);

  // ── Activity Log ───────────────────────────────────────────────────────────
  const addLog = (user, action, target, icon = '🔄') => {
    const entry = {
      id: Date.now(),
      user, action, target, icon,
      time: new Date().toLocaleString('uz-UZ'),
    };
    setLog(prev => [entry, ...prev].slice(0, 50));
  };

  // ── Employee CRUD ──────────────────────────────────────────────────────────
  const addEmployee = (data) => {
    const id  = Date.now();
    const emp = { ...data, id };

    // 1. Add employee
    const newEmps = [...employees, emp];
    setEmp(() => newEmps);

    // 2. Add attendance record
    const newAtt = [
      ...attendance,
      { id: id + 1, employeeId: id, name: data.name, date: todayDate(),
        checkIn: null, checkOut: null, status: 'Absent', late: false, workHours: 0 },
    ];
    setAtt(() => newAtt);

    // 3. Add salary record
    const base = Number(data.salary) || 0;
    const newSal = [
      ...salaries,
      { id: id + 2, employeeId: id, name: data.name, role: data.role,
        base, bonus: 0, deductions: 0, net: base,
        month: currentMonth(), status: 'Pending' },
    ];
    setSal(() => newSal);

    addLog('Admin', "Yangi xodim qo'shildi", data.name, '👤');
    return emp;
  };

  const updateEmployee = (id, data) => {
    setEmp(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    if (data.name) setAtt(prev => prev.map(a =>
      a.employeeId === id ? { ...a, name: data.name } : a
    ));
    if (data.name || data.role) setSal(prev => prev.map(s =>
      s.employeeId === id
        ? { ...s, ...(data.name && { name: data.name }), ...(data.role && { role: data.role }) }
        : s
    ));
    if (data.salary !== undefined) setSal(prev => prev.map(s => {
      if (s.employeeId !== id) return s;
      const base = Number(data.salary) || s.base;
      return { ...s, base, net: base + s.bonus - s.deductions };
    }));
    // If edited employee is the logged-in user → update Navbar instantly
    try {
      const SESSION_KEY = 'sf_auth';
      const session = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (session && session.employeeId === id) {
        const patch = {};
        if (data.name)  patch.name  = data.name;
        if (data.email) patch.email = data.email;
        if (Object.keys(patch).length) updateAuth(patch);
      }
    } catch { /* ignore */ }
  };

  const deleteEmployee = (id, email) => {
    // 1. Remove from employees, attendance, salary, tasks
    setEmp(prev => prev.filter(e => e.id !== id));
    setAtt(prev => prev.filter(a => a.employeeId !== id));
    setSal(prev => prev.filter(s => s.employeeId !== id));
    setTask(prev => prev.map(t =>
      t.assigneeId === id ? { ...t, assigneeId: null, assignee: 'Tayinlanmagan' } : t
    ));
    // 2. Remove from sf_accounts so they can't login anymore
    if (email) {
      try {
        const accounts = JSON.parse(localStorage.getItem('sf_accounts')) || [];
        const updated  = accounts.filter(a => a.email !== email.toLowerCase());
        localStorage.setItem('sf_accounts', JSON.stringify(updated));
      } catch { /* ignore */ }
    }
    addLog('Admin', "Xodim o'chirildi", `ID: ${id}`, '🗑️');
  };

  // ── Task CRUD ──────────────────────────────────────────────────────────────
  const addTask = (data) => {
    const task = { ...data, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    setTask(prev => [...prev, task]);
    addLog('Admin', "Yangi vazifa qo'shildi", data.title, '✅');
  };
  const updateTask = (id, data) =>
    setTask(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTask = (id) =>
    setTask(prev => prev.filter(t => t.id !== id));

  // ── Attendance ─────────────────────────────────────────────────────────────
  const checkIn = (employeeId) => {
    const now  = new Date();
    const time = now.toTimeString().slice(0, 5);
    const late = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    setAtt(prev => prev.map(a =>
      a.employeeId === employeeId ? { ...a, checkIn: time, status: 'Present', late } : a
    ));
  };
  const checkOut = (employeeId) => {
    const now  = new Date();
    const time = now.toTimeString().slice(0, 5);
    setAtt(prev => prev.map(a => {
      if (a.employeeId !== employeeId) return a;
      const [inH, inM]   = (a.checkIn || '09:00').split(':').map(Number);
      const [outH, outM] = time.split(':').map(Number);
      const hours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
      return { ...a, checkOut: time, workHours: Math.round(hours * 100) / 100 };
    }));
  };
  const toggleAttendance = (id) =>
    setAtt(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'Present' ? 'Absent' : 'Present' } : a
    ));

  // ── Salary ─────────────────────────────────────────────────────────────────
  const updateSalary = (id, data) => {
    setSal(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...data };
      updated.net = updated.base + updated.bonus - updated.deductions;
      return updated;
    }));
  };

  return (
    <AppContext.Provider value={{
      employees, addEmployee, updateEmployee, deleteEmployee,
      tasks, addTask, updateTask, deleteTask,
      attendance, checkIn, checkOut, toggleAttendance,
      salaries, updateSalary,
      activityLogs, addLog,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
