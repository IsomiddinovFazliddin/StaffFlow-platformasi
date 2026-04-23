import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = ['admin', 'hr_manager', 'team_lead'];
const ACCOUNTS_KEY = 'sf_accounts';

// Check if current session account still exists in sf_accounts
const isSessionValid = (auth) => {
  if (!auth) return false;
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
    // If no accounts exist yet (fresh install), allow through
    if (accounts.length === 0) return true;
    return accounts.some(a => a.id === auth.id);
  } catch { return true; }
};

export default function ProtectedRoute({ allowedRole }) {
  const { auth, logout } = useAuth();

  // Not logged in
  if (!auth) return <Navigate to="/login" replace />;

  // Account was deleted — force logout
  if (!isSessionValid(auth)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  // Role-based guard
  if (allowedRole === 'admin-level') {
    if (!ADMIN_ROLES.includes(auth.role))
      return <Navigate to="/unauthorized" replace />;
  } else if (allowedRole === 'employee') {
    if (ADMIN_ROLES.includes(auth.role))
      return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
