import { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_PERMISSIONS } from '../utils/mockData';

const AuthContext  = createContext(null);
const SESSION_KEY  = 'sf_auth';
const ACCOUNTS_KEY = 'sf_accounts';

// ── Helpers ───────────────────────────────────────────────────────────────────
const loadAccounts = () => {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []; }
  catch { return []; }
};
const saveAccounts = (list) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));

const buildSession = (user, employeeId = null, name = null) => ({
  id:          user.id,
  name:        name ?? user.name,
  email:       user.email,
  role:        user.role,
  employeeId:  employeeId ?? user.employeeId ?? null,
  permissions: ROLE_PERMISSIONS[user.role] || [],
});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  // Reactive pending count — updates when approve/reject called
  const [pendingCount, setPendingCount] = useState(() =>
    loadAccounts().filter(a => a.status === 'pending').length
  );

  const refreshPendingCount = () => {
    setPendingCount(loadAccounts().filter(a => a.status === 'pending').length);
  };

  // Sync when AppContext patches sf_auth
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== SESSION_KEY || !e.newValue) return;
      try { setAuth(JSON.parse(e.newValue)); } catch { /* ignore */ }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Migration: upgrade existing hr_manager accounts to admin
  useEffect(() => {
    try {
      const accounts = loadAccounts();
      const migrated = accounts.map(a =>
        a.role === 'admin' ? { ...a, role: 'admin' } : a
      );
      if (migrated.some((a, i) => a.role !== accounts[i].role)) {
        saveAccounts(migrated);
      }
      // Also migrate current session
      const session = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (session?.role === 'admin') {
        const updated = { ...session, role: 'admin', permissions: ROLE_PERMISSIONS['admin'] || [] };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setAuth(updated);
      }
    } catch { /* ignore */ }
  }, []);

  // Check if current session is still valid (account not deleted)
  useEffect(() => {
    if (!auth) return;
    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
      const stillExists = accounts.find(a => a.id === auth.id);
      if (!stillExists) {
        // Account was deleted — force logout
        localStorage.removeItem(SESSION_KEY);
        setAuth(null);
      }
    } catch { /* ignore */ }
  }, [auth?.id]);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = ({ name, email, password }) => {
    const accounts = loadAccounts();
    if (accounts.find(a => a.email === email.toLowerCase().trim()))
      return { error: 'Bu email allaqachon ro\'yxatdan o\'tgan' };

    const role   = accounts.length === 0 ? 'admin' : 'employee';
    // First user (admin) is auto-approved; others are pending
    const status = accounts.length === 0 ? 'active' : 'pending';
    const newUser = {
      id: Date.now(), name: name.trim(),
      email: email.toLowerCase().trim(), password,
      role, employeeId: null, status,
      registeredAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, newUser]);

    // Pending users don't get a session — they must wait for approval
    if (status === 'pending') {
      return { pending: true };
    }

    const session = buildSession(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
    return { user: session };
  };

  const login = (email, password) => {
    const accounts = loadAccounts();

    // Step 1: find by email only
    const user = accounts.find(a => a.email === email.toLowerCase().trim());
    if (!user) return { error: 'Foydalanuvchi topilmadi' };

    // Step 2: status checks
    if (user.status === 'pending')
      return { error: 'Hisobingiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.' };
    if (user.status === 'rejected')
      return { error: 'Hisobingiz rad etilgan. Admin bilan bog\'laning.' };
    if (user.status && user.status !== 'active')
      return { error: 'Hisobingiz faol emas.' };

    // Step 3: password check
    if (user.password !== password)
      return { error: 'Parol noto\'g\'ri' };

    // Step 4: department check for non-admin roles
    if (['employee', 'team_lead'].includes(user.role)) {
      try {
        const liveEmps = JSON.parse(localStorage.getItem('sf_employees')) || [];
        const emp = liveEmps.find(e => e.email?.toLowerCase() === user.email?.toLowerCase());
        if (liveEmps.length > 0 && !emp?.department) {
          return { error: 'Hisobingizga bo\'lim tayinlanmagan. Admin bilan bog\'laning.' };
        }
      } catch { /* allow */ }
    }

    // Resolve live employee record — ONLY by exact email match, no fallback
    let resolvedId   = user.employeeId;
    let resolvedName = user.name;
    if (user.role === 'employee' || user.role === 'team_lead') {
      try {
        const liveEmps = JSON.parse(localStorage.getItem('sf_employees')) || [];
        const match = liveEmps.find(e => e.email?.toLowerCase() === user.email?.toLowerCase());
        if (match) {
          resolvedId   = match.id;
          resolvedName = match.name;
        }
        // No fallback to liveEmps[0] — that caused wrong user to be shown
      } catch { /* use defaults */ }
    }

    // Clear any previous session before saving new one
    localStorage.removeItem(SESSION_KEY);

    const session = buildSession(user, resolvedId, resolvedName);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
    return { user: session };
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    // Clear user-specific cached data
    localStorage.removeItem('sf_profile');
    setAuth(null);
  };

  // ── Patch auth + localStorage ───────────────────────────────────────────────
  const updateAuth = (patch) => {
    setAuth(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Create account for employee (Admin → Employees page) ────────────────────
  const createAccount = ({ name, email, password, role = 'employee', employeeId = null }) => {
    const accounts = loadAccounts();
    if (accounts.find(a => a.email === email.toLowerCase().trim()))
      return { error: 'Bu email allaqachon mavjud' };
    const newUser = {
      id: Date.now(), name, email: email.toLowerCase().trim(),
      password, role, employeeId,
      status: 'active', // Admin-created accounts are immediately active
    };
    saveAccounts([...accounts, newUser]);
    return { user: newUser };
  };

  // ── Approve pending user ────────────────────────────────────────────────────
  const approveUser = (userId, { department, role }) => {
    const accounts = loadAccounts();
    const updated = accounts.map(a =>
      a.id === userId ? { ...a, status: 'active', role, department } : a
    );
    saveAccounts(updated);
    refreshPendingCount();
    return { success: true };
  };

  // ── Reject pending user ─────────────────────────────────────────────────────
  const rejectUser = (userId) => {
    const accounts = loadAccounts();
    const updated = accounts.map(a =>
      a.id === userId ? { ...a, status: 'rejected' } : a
    );
    saveAccounts(updated);
    refreshPendingCount();
    return { success: true };
  };

  // ── Get pending users ───────────────────────────────────────────────────────
  const getPendingUsers = () =>
    loadAccounts().filter(a => a.status === 'pending');

  // ── Change password ─────────────────────────────────────────────────────────
  const changePassword = (currentPassword, newPassword) => {
    if (!auth) return { error: 'Tizimga kiring' };
    const accounts = loadAccounts();
    const idx = accounts.findIndex(a => a.id === auth.id && a.password === currentPassword);
    if (idx === -1) return { error: 'Joriy parol noto\'g\'ri' };
    if (newPassword.length < 6) return { error: 'Yangi parol kamida 6 ta belgi bo\'lishi kerak' };
    const updated = [...accounts];
    updated[idx] = { ...updated[idx], password: newPassword };
    saveAccounts(updated);
    return { success: true };
  };

  const can          = (permission) => auth?.permissions?.includes(permission) ?? false;
  const hasRole      = (...roles)   => roles.includes(auth?.role);
  const isAdminLevel = ()           => hasRole('admin', 'team_lead');

  return (
    <AuthContext.Provider value={{
      auth, login, logout, register, updateAuth, createAccount, changePassword,
      approveUser, rejectUser, getPendingUsers, pendingCount,
      can, hasRole, isAdminLevel,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
