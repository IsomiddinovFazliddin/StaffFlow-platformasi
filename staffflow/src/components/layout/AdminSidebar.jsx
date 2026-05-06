import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, ListTodo,
  CalendarCheck, Banknote, Activity,
  AlertOctagon, BarChart2, FileText, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../utils/mockData';
import Logo from '../ui/Logo';

const ALL_NAV = [
  { to: '/admin',             label: 'Boshqaruv paneli',  Icon: LayoutDashboard, end: true,  permission: PERMISSIONS.VIEW_DASHBOARD },
  { to: '/admin/employees',   label: 'Xodimlar',          Icon: Users,           permission: PERMISSIONS.VIEW_EMPLOYEES },
  { to: '/admin/departments', label: "Bo'limlar",         Icon: Briefcase,       permission: PERMISSIONS.VIEW_DEPARTMENTS },
  { to: '/admin/tasks',       label: 'Vazifalar',         Icon: ListTodo,        permission: PERMISSIONS.VIEW_ALL_TASKS },
  { to: '/admin/attendance',  label: 'Davomat',           Icon: CalendarCheck,   permission: PERMISSIONS.VIEW_ALL_ATTENDANCE },
  { to: '/admin/salary',      label: 'Maosh',             Icon: Banknote,        permission: PERMISSIONS.VIEW_ALL_SALARY },
  { to: '/admin/activity',    label: 'Faoliyat',          Icon: Activity,        permission: PERMISSIONS.VIEW_REPORTS },
  { to: '/admin/penalties',   label: 'Jarima tizimi',     Icon: AlertOctagon,    permission: PERMISSIONS.MANAGE_SETTINGS },
  { to: '/admin/analytics',   label: 'Analitika',         Icon: BarChart2,        permission: PERMISSIONS.VIEW_REPORTS },
  { to: '/admin/hisobotlar',  label: 'Hisobotlar',        Icon: FileText,         permission: PERMISSIONS.VIEW_REPORTS },
  { to: '/admin/pending',     label: 'Tasdiqlash',        Icon: UserCheck,        permission: PERMISSIONS.MANAGE_SETTINGS },
];

const ROLE_LABEL_OVERRIDES = {
  team_lead: { '/admin/employees': 'Mening jamoam' },
};

const HR_EXTRA = [];

const THEME = {
  admin:      { bg: 'bg-indigo-900', border: 'border-indigo-800', active: 'bg-indigo-700', hover: 'hover:bg-indigo-800', text: 'text-indigo-200', footer: 'text-indigo-400' },
  hr_manager: { bg: 'bg-blue-900',   border: 'border-blue-800',   active: 'bg-blue-700',   hover: 'hover:bg-blue-800',   text: 'text-blue-200',   footer: 'text-blue-400' },
  team_lead:  { bg: 'bg-cyan-900',   border: 'border-cyan-800',   active: 'bg-cyan-700',   hover: 'hover:bg-cyan-800',   text: 'text-cyan-200',   footer: 'text-cyan-400' },
};

const THEME_COLORS = {
  admin:      '#1e1b4b',
  hr_manager: '#1e3a5f',
  team_lead:  '#083344',
};

function SidebarInner({ theme, navItems, collapsed, onClose, version, role, pendingCount }) {
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
    ${collapsed ? 'justify-center px-0' : ''}
    ${isActive ? `${theme.active} text-white` : `${theme.text} ${theme.hover} hover:text-white`}`;

  return (
    <div
      className={`h-full flex flex-col ${theme.bg} text-white overflow-hidden`}
      style={{ backgroundColor: THEME_COLORS[role] ?? THEME_COLORS.admin }}
    >
      {/* Logo */}
      <div className={`h-16 shrink-0 border-b ${theme.border} flex items-center
        ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Logo collapsed={collapsed} variant="dark" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose}
            className={linkClass} title={collapsed ? label : undefined}>
            <Icon
              size={20}
              strokeWidth={1.75}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            {!collapsed && (
              <span className="flex-1 flex items-center justify-between truncate">
                <span className="truncate">{label}</span>
                {to === '/admin/pending' && pendingCount > 0 && (
                  <span
                    className="ml-2 bg-red-500 text-white font-bold rounded-full flex items-center justify-center shrink-0"
                    style={{ minWidth: '20px', height: '20px', fontSize: '10px', padding: '0 4px' }}
                  >
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </span>
            )}
            {collapsed && to === '/admin/pending' && pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className={`px-5 py-3 border-t ${theme.border} text-xs ${theme.footer} shrink-0`}>
          {version}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ open, onClose, collapsed }) {
  const { auth, can, pendingCount } = useAuth();

  const role      = auth?.role ?? 'admin';
  const theme     = THEME[role] ?? THEME.admin;
  const overrides = ROLE_LABEL_OVERRIDES[role] ?? {};

  let navItems = ALL_NAV
    .filter(item => can(item.permission))
    .map(item => ({ ...item, label: overrides[item.to] ?? item.label }));

  if (role === 'admin') {
    const empIdx = navItems.findIndex(n => n.to === '/admin/employees');
    if (empIdx !== -1) {
      navItems = [
        ...navItems.slice(0, empIdx + 1),
        ...HR_EXTRA.filter(e => can(e.permission)),
        ...navItems.slice(empIdx + 1),
      ];
    }
  }

  const props = { theme, navItems, version: 'v1.0.0', role, pendingCount };

  return (
    <>
      {/* Desktop: static */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        <SidebarInner {...props} collapsed={collapsed} onClose={() => {}} />
      </aside>

      {/* Mobile/tablet: overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out
          ${open ? 'visible' : 'invisible'}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300
            ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-64 z-50
            ${theme.bg}
            transition-transform duration-300 ease-in-out
            ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarInner {...props} collapsed={false} onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
