import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import Navbar from './Navbar';

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);

  useEffect(() => {
    const handle = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
        setSidebarOpen(false);
      } else {
        setCollapsed(false);
      }
    };
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      <EmployeeSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 dark:bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
