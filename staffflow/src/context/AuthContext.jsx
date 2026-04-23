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

  // Sync when AppContext patches sf_auth
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== SESSION_KEY || !e.newValue) return;
      try { setAuth(JSON.parse(e.newValue)); } catch { /* ignore */ }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
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

    const role    = accounts.length === 0 ? 'admin' : 'employee';
    const newUser = {
      id: Date.now(), name: name.trim(),
      email: email.toLowerCase().trim(), password,
      role, employeeId: null,
    };
    saveAccounts([...accounts, newUser]);

    const session = buildSession(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
    return { user: session };
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = (email, password) => {
    const accounts = loadAccounts();
    const user = accounts.find(
      a => a.email === email.toLowerCase().trim() && a.password === password
    );

    if (!user) return { error: 'Email yoki parol noto\'g\'ri' };

    // Resolve live employee record for employee role
    let resolvedId   = user.employeeId;
    let resolvedName = user.name;
    if (user.role === 'employee') {
      try {
        const liveEmps = JSON.parse(localStorage.getItem('sf_employees')) || [];
        const match    = liveEmps.find(e => e.email === user.email) ?? liveEmps[0] ?? null;
        if (match) { resolvedId = match.id; resolvedName = match.name; }
      } catch { /* use defaults */ }
    }

    const session = buildSession(user, resolvedId, resolvedName);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
    return { user: session };
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
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
    };
    saveAccounts([...accounts, newUser]);
    return { user: newUser };
  };

  const can          = (permission) => auth?.permissions?.includes(permission) ?? false;
  const hasRole      = (...roles)   => roles.includes(auth?.role);
  const isAdminLevel = ()           => hasRole('admin', 'hr_manager', 'team_lead');

  return (
    <AuthContext.Provider value={{
      auth, login, logout, register, updateAuth, createAccount,
      can, hasRole, isAdminLevel,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
