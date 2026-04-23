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
import Vacancies         from '../pages/Vacancies/Vacancies';
import Interviews        from '../pages/Interviews/Interviews';

// Employee layout + pages
import EmployeeLayout    from '../components/layout/EmployeeLayout';
import EmployeeDashboard from '../pages/Employee/EmployeeDashboard';
import MyTasks           from '../pages/Employee/MyTasks';
import MySalary          from '../pages/Employee/MySalary';

const ADMIN_ROLES = ['admin', 'hr_manager', 'team_lead'];

function RootRedirect() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <Navigate to={ADMIN_ROLES.includes(auth.role) ? '/admin' : '/employee'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<SignUp />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<RootRedirect />} />

      {/* ── Admin-level routes (admin, hr_manager, team_lead) ── */}
      <Route element={<ProtectedRoute allowedRole="admin-level" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<Dashboard />} />
          <Route path="employees"     element={<Employees />} />
          <Route path="departments"   element={<Departments />} />
          <Route path="tasks"         element={<Tasks />} />
          <Route path="attendance"    element={<Attendance />} />
          <Route path="salary"        element={<Salary />} />
          <Route path="activity"      element={<ActivityLog />} />
          <Route path="vacancies"     element={<Vacancies />} />
          <Route path="interviews"    element={<Interviews />} />
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
          <Route path="settings"      element={<Settings />} />
          <Route path="profile"       element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
