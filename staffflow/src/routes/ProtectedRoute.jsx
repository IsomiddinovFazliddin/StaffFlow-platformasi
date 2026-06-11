import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = ['admin', 'team_lead'];

export default function ProtectedRoute({ allowedRole }) {
  const { auth } = useAuth();

  // Not logged in or no token
  if (!auth || !auth.token) return <Navigate to="/login" replace />;

  // Role-based guard
  if (allowedRole === 'admin-level') {
    if (!ADMIN_ROLES.includes(auth.role))
      return <Navigate to="/employee" replace />;
  } else if (allowedRole === 'employee') {
    if (ADMIN_ROLES.includes(auth.role))
      return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
