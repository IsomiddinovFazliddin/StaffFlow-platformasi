/**
 * api.js — Centralized API client for StaffFlow backend
 *
 * Usage:
 *   import api from '../utils/api';
 *   const { user } = await api.auth.me();
 *
 * When backend is ready, set VITE_API_URL in .env:
 *   VITE_API_URL=http://localhost:5000
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Token helpers ─────────────────────────────────────────────────────────────
const getToken = () => {
  try { return JSON.parse(localStorage.getItem('sf_auth'))?.token || null; }
  catch { return null; }
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const patch  = (path, body)  => request('PATCH',  path, body);
const del    = (path)        => request('DELETE', path);

// ── API modules ───────────────────────────────────────────────────────────────
const api = {

  // Auth
  auth: {
    login:          (email, password) => post('/auth/login', { email, password }),
    me:             ()                => get('/auth/me'),
    updateMe:       (data)            => patch('/auth/me', data),
    changePassword: (currentPassword, newPassword) =>
      patch('/auth/change-password', { currentPassword, newPassword }),
  },

  // Users (Admin/HR)
  users: {
    list:       (params = {}) => get('/users?' + new URLSearchParams(params)),
    get:        (id)          => get(`/users/${id}`),
    create:     (data)        => post('/users', data),
    update:     (id, data)    => patch(`/users/${id}`, data),
    delete:     (id)          => del(`/users/${id}`),
    assignRole: (userId, role) => post('/users/assign-role', { userId, role }),
  },

  // Departments
  departments: {
    list:   ()         => get('/departments'),
    create: (data)     => post('/departments', data),
    update: (id, data) => patch(`/departments/${id}`, data),
    delete: (id)       => del(`/departments/${id}`),
  },

  // Tasks
  tasks: {
    list:   ()         => get('/tasks'),
    create: (data)     => post('/tasks', data),
    update: (id, data) => patch(`/tasks/${id}`, data),
    delete: (id)       => del(`/tasks/${id}`),
  },

  // Attendance
  attendance: {
    list:     (params = {}) => get('/attendance?' + new URLSearchParams(params)),
    checkIn:  ()            => post('/attendance/checkin'),
    checkOut: ()            => post('/attendance/checkout'),
    update:   (id, data)    => patch(`/attendance/${id}`, data),
  },

  // Salary
  salary: {
    list:   ()         => get('/salary'),
    create: (data)     => post('/salary', data),
    update: (id, data) => patch(`/salary/${id}`, data),
  },

  // Notifications
  notifications: {
    list:    ()   => get('/notifications'),
    read:    (id) => patch(`/notifications/${id}/read`),
    readAll: ()   => patch('/notifications/read-all'),
  },

  // Vacancies
  vacancies: {
    list:   ()         => get('/vacancies'),
    create: (data)     => post('/vacancies', data),
    update: (id, data) => patch(`/vacancies/${id}`, data),
    delete: (id)       => del(`/vacancies/${id}`),
  },

  // Interviews
  interviews: {
    list:   ()         => get('/interviews'),
    create: (data)     => post('/interviews', data),
    update: (id, data) => patch(`/interviews/${id}`, data),
    delete: (id)       => del(`/interviews/${id}`),
  },
};

export default api;
