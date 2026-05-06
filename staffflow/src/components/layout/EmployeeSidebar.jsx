import { NavLink } from 'react-router-dom';
import { ListTodo, CalendarCheck, Banknote, AlertOctagon, Users } from 'lucide-react';
import Logo from '../ui/Logo';

const NAV_ITEMS = [
  { to: '/employee/my-tasks',     label: 'Mening vazifalarim', Icon: ListTodo },
  { to: '/employee/attendance',   label: 'Davomat',            Icon: CalendarCheck },
  { to: '/employee/my-salary',    label: 'Mening maoshim',     Icon: Banknote },
  { to: '/employee/my-team',      label: 'Mening jamoam',      Icon: Users },
  { to: '/employee/my-penalties', label: 'Jarimalarim',        Icon: AlertOctagon },
];

function SidebarInner({ collapsed, onClose, version }) {
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
    ${collapsed ? 'justify-center px-0' : ''}
    ${isActive ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'}`;

  return (
    <div className="h-full flex flex-col bg-emerald-900 text-white overflow-hidden" style={{ backgroundColor: '#064e3b' }}>
      {/* Logo */}
      <div className={`h-16 shrink-0 border-b border-emerald-800 flex items-center
        ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <Logo collapsed={collapsed} variant="dark" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose}
            className={linkClass} title={collapsed ? label : undefined}>
            <Icon
              size={20}
              strokeWidth={1.75}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-5 py-3 border-t border-emerald-800 text-xs text-emerald-400 shrink-0">
          {version}
        </div>
      )}
    </div>
  );
}

export default function EmployeeSidebar({ open, onClose, collapsed }) {
  return (
    <>
      {/* Desktop: static */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        <SidebarInner collapsed={collapsed} onClose={() => {}} version="v1.0.0" />
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
            bg-emerald-900
            transition-transform duration-300 ease-in-out
            ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarInner collapsed={false} onClose={onClose} version="v1.0.0" />
        </aside>
      </div>
    </>
  );
}
