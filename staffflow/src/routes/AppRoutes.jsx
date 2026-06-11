import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ProtectedRoute    from './ProtectedRoute';
import Login             from '../pages/Login/Login';
import SignUp            from '../pages/Login/SignUp';
import Unauthorized      from '../pages/Unauthorized';

// Admin layout + pages
import AdminLayout       from '../components/layout/AdminLayout';
import Dashboard         from '../pages/Dashboard/Dashboard';
import Employees         from '../pages/Employees/Employees';
import Departments       from '../pages/Departments/Departments';
import Tasks             from '../pages/Tasks/Tasks';
import Attendance        from '../pages/Attendance/Attendance';
import Salary            from '../pages/Salary/Salary';
import Settings          from '../pages/Settings/Settings';
import Profile           from '../pages/Profile/Profile';
import ActivityLog       from '../pages/ActivityLog/ActivityLog';
import Penalties         from '../pages/Penalties/Penalties';
import Hisobotlar        from '../pages/Hisobotlar/index';
import PendingApprovals  from '../pages/PendingApprovals/PendingApprovals';
import PendingApproval   from '../pages/Login/PendingApproval';

// Employee layout + pages
import EmployeeLayout    from '../components/layout/EmployeeLayout';
import EmployeeDashboard from '../pages/Employee/EmployeeDashboard';
import MyTasks           from '../pages/Employee/MyTasks';
import MySalary          from '../pages/Employee/MySalary';
import MyPenalties       from '../pages/Employee/MyPenalties';
import MyTeam            from '../pages/Employee/MyTeam';

const ADMIN_ROLES = ['admin', 'team_lead'];

function RootRedirect() {
  const { auth } = useAuth();
  if (!auth || !auth.token) return <Navigate to="/login" replace />;
  return <Navigate to={ADMIN_ROLES.includes(auth.role) ? '/admin' : '/employee'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<SignUp />} />
      <Route path="/pending"      element={<PendingApproval />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<RootRedirect />} />

      {/* ── Admin-level routes ── */}
      <Route element={<ProtectedRoute allowedRole="admin-level" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<Dashboard />} />
          <Route path="employees"     element={<Employees />} />
          <Route path="departments"   element={<Departments />} />
          <Route path="tasks"         element={<Tasks />} />
          <Route path="attendance"    element={<Attendance />} />
          <Route path="salary"        element={<Salary />} />
          <Route path="activity"      element={<ActivityLog />} />
          <Route path="penalties"     element={<Penalties />} />
          <Route path="hisobotlar"    element={<Hisobotlar />} />
          <Route path="pending"       element={<PendingApprovals />} />
          <Route path="settings"      element={<Settings />} />
          <Route path="profile"       element={<Profile />} />
        </Route>
      </Route>

      {/* ── Employee routes ── */}
      <Route element={<ProtectedRoute allowedRole="employee" />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index                element={<EmployeeDashboard />} />
          <Route path="my-tasks"      element={<MyTasks />} />
          <Route path="attendance"    element={<Attendance />} />
          <Route path="my-salary"     element={<MySalary />} />
          <Route path="my-team"       element={<MyTeam />} />
          <Route path="my-penalties"  element={<MyPenalties />} />
          <Route path="settings"      element={<Settings />} />
          <Route path="profile"       element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
