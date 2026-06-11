import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '../firebase';
import { ROLE_PERMISSIONS } from '../utils/mockData';
import api from '../utils/api';

const AuthContext = createContext(null);
const SESSION_KEY = 'sf_auth';

// ── Build session from backend user ──────────────────────────────────────────
const buildSession = (user, token) => ({
  id:           user.id || user._id,
  name:         user.name || user.full_name || '',
  email:        user.email,
  role:         user.role,
  token:        token,
  employeeId:   user.id || user._id,
  departmentId: user.departmentId || user.department_id || null,
  department:   user.department || user.department_name || user.departmentName || null,
  permissions:  ROLE_PERMISSIONS[user.role] || [],
});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending count from backend (admin only)
  const refreshPendingCount = async () => {
    if (!auth?.token || auth?.role !== 'admin') return;
    try {
      const res = await api.approvals.pendingCount();
      setPendingCount(res.count || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (auth?.role === 'admin') refreshPendingCount();
  }, [auth?.token]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      const session = buildSession(res.user, res.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setAuth(session);
      return { user: session };
    } catch (err) {
      return { error: err.message || 'Kirish xatoligi' };
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async ({ name, email, password }) => {
    try {
      const res = await api.auth.register({ name, email, password });
      // Birinchi foydalanuvchi → admin, darhol login
      if (res.token && res.user) {
        const session = buildSession(res.user, res.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setAuth(session);
        return { user: session };
      }
      return { pending: true };
    } catch (err) {
      return { error: err.message || 'Ro\'yxatdan o\'tish xatoligi' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('sf_profile');
    setAuth(null);
    setPendingCount(0);
  };

  // ── Update auth session ───────────────────────────────────────────────────
  const updateAuth = (patch) => {
    setAuth(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Google Auth ───────────────────────────────────────────────────────────
  const loginWithGoogle = async (mode = 'register') => {
    // 1. Firebase popup
    let firebaseResult;
    try {
      firebaseResult = await signInWithPopup(firebaseAuth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return null;
      if (err.code === 'auth/cancelled-popup-request') return null;
      if (err.code === 'auth/popup-blocked') return { error: 'Popup bloklandi. Brauzer sozlamalarini tekshiring.' };
      return { error: err.message || 'Google bilan kirishda xatolik' };
    }

    // 2. Firebase muvaffaqiyatli — backend ga yuboramiz
    const gUser = firebaseResult.user;
    const email = gUser.email?.toLowerCase().trim();
    const name  = gUser.displayName || email.split('@')[0];

    // Popup yopilgandan keyin kichik kutish (brauzer focus qaytishi uchun)
    await new Promise(r => setTimeout(r, 500));

    // Vite proxy orqali yuborish — CORS muammosi yo'q
    try {
      const resp = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, googleUid: gUser.uid, mode }),
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        return { error: data.message || `Xato: ${resp.status}` };
      }

      if (data.pending) return { pending: true };

      if (!data.token || !data.user) {
        return { error: 'Serverdan noto\'g\'ri javob keldi' };
      }

      const session = buildSession(data.user, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setAuth(session);
      return { user: session };

    } catch (netErr) {
      return { error: 'Tizimga ulanib bo\'lmadi. Backend ishga tushirilganligini tekshiring.' };
    }
  };

  // ── Create account (Admin → Employees page) ───────────────────────────────
  const createAccount = async ({ name, email, password, role = 'employee', employeeId = null }) => {
    try {
      const res = await api.users.create({
        name, email, password,
        role,
        approvalStatus: 'approved',
        status: 'Active',
      });
      return { user: res.user };
    } catch (err) {
      return { error: err.message };
    }
  };

  // ── Approve pending user ──────────────────────────────────────────────────
  const approveUser = async (userId, { department, role, departmentId }) => {
    try {
      const res = await api.approvals.approve(userId, {
        role: role || 'employee',
        departmentId: departmentId || null,
      });
      setPendingCount(res.pendingCount || 0);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  // ── Reject pending user ───────────────────────────────────────────────────
  const rejectUser = async (userId) => {
    try {
      const res = await api.approvals.reject(userId);
      setPendingCount(res.pendingCount || 0);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  // ── Get pending users ─────────────────────────────────────────────────────
  const getPendingUsers = async () => {
    try {
      const res = await api.approvals.pending();
      return res.pending || [];
    } catch { return []; }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    if (!auth) return { error: 'Tizimga kiring' };
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const can          = (permission) => auth?.permissions?.includes(permission) ?? false;
  const hasRole      = (...roles)   => roles.includes(auth?.role);
  const isAdminLevel = ()           => hasRole('admin', 'team_lead');

  return (
    <AuthContext.Provider value={{
      auth, login, logout, register, updateAuth, createAccount, changePassword,
      loginWithGoogle,
      approveUser, rejectUser, getPendingUsers, pendingCount, refreshPendingCount,
      can, hasRole, isAdminLevel,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
