/**
 * api.js — Centralized API client for StaffFlow backend
 * All requests include Authorization: Bearer {token} automatically.
 */

const BASE = import.meta.env.VITE_API_URL || '';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => {
  try { return JSON.parse(localStorage.getItem('sf_auth'))?.token || null; }
  catch { return null; }
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // BASE bo'sh bo'lsa — Vite proxy orqali /api ga yuboradi (CORS muammosi yo'q)
  // BASE to'ldirilgan bo'lsa — to'g'ridan-to'g'ri backend ga yuboradi
  const url = BASE ? `${BASE}/api${path}` : `/api${path}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const put    = (path, body)  => request('PUT',    path, body);
const patch  = (path, body)  => request('PATCH',  path, body);
const del    = (path)        => request('DELETE', path);

// ── API modules ───────────────────────────────────────────────────────────────
const api = {

  // Auth
  auth: {
    login:          (email, password) => post('/auth/login', { email, password }),
    register:       (data)            => post('/auth/register', data),
    google:         (data)            => post('/auth/google', data),
    me:             ()                => get('/auth/me'),
    updateMe:       (data)            => patch('/auth/me', data),
    changePassword: (currentPassword, newPassword) =>
      patch('/auth/change-password', { currentPassword, newPassword }),
  },

  // Users / Employees
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
    list:   (params = {}) => get('/tasks?' + new URLSearchParams(params)),
    create: (data)        => post('/tasks', data),
    update: (id, data)    => patch(`/tasks/${id}`, data),
    delete: (id)          => del(`/tasks/${id}`),
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
    list:   (params = {}) => get('/salary?' + new URLSearchParams(params)),
    create: (data)        => post('/salary', data),
    update: (id, data)    => patch(`/salary/${id}`, data),
  },

  // Penalties
  penalties: {
    list:   (params = {}) => get('/penalties?' + new URLSearchParams(params)),
    create: (data)        => post('/penalties', data),
    update: (id, data)    => patch(`/penalties/${id}`, data),
    delete: (id)          => del(`/penalties/${id}`),
  },

  // Approvals
  approvals: {
    pending:      ()         => get('/approvals/pending'),
    pendingCount: ()         => get('/approvals/pending-count'),
    approve:      (id, data) => put(`/approvals/${id}/approve`, data),
    reject:       (id)       => put(`/approvals/${id}/reject`),
  },

  // Analytics
  analytics: {
    summary: () => get('/analytics'),
  },

  // Notifications
  notifications: {
    list:    ()   => get('/notifications'),
    read:    (id) => patch(`/notifications/${id}/read`),
    readAll: ()   => patch('/notifications/read-all'),
  },
};

export default api;
