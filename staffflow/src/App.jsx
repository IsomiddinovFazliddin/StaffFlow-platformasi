import { BrowserRouter } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { PenaltyProvider } from './context/PenaltyContext';
import { ThemeProvider } from './context/ThemeContext';
import NotificationToast from './components/ui/NotificationToast';
import AppRoutes from './routes/AppRoutes';
import { clearAllStorage } from './utils/storage';

// ── One-time migration: clear stale localStorage so employees/attendance/salary
//    are rebuilt in sync. Bump the version string to force a re-clear.
const SCHEMA_VERSION = 'v5';
if (localStorage.getItem('sf_schema') !== SCHEMA_VERSION) {
  clearAllStorage();
  localStorage.setItem('sf_schema', SCHEMA_VERSION);
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <NotificationProvider>
            <UserProvider>
              <DepartmentProvider>
                <AppProvider>
                  <PenaltyProvider>
                    <AppRoutes />
                    <NotificationToast />
                  </PenaltyProvider>
                </AppProvider>
              </DepartmentProvider>
            </UserProvider>
          </NotificationProvider>
        </AuthProvider>
      </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
