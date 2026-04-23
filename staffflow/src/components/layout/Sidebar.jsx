import { NavLink } from 'react-router-dom';
import { useTranslate } from '../../hooks/useTranslate';

const navItems = [
  { to: '/dashboard',   key: 'nav.dashboard',   icon: '🏠' },
  { to: '/employees',   key: 'nav.employees',   icon: '👥' },
  { to: '/departments', key: 'nav.departments', icon: '🏢' },
  { to: '/tasks',       key: 'nav.tasks',       icon: '✅' },
  { to: '/attendance',  key: 'nav.attendance',  icon: '📅' },
  { to: '/salary',      key: 'nav.salary',      icon: '💰' },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
  ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`;

export default function Sidebar({ open, onClose }) {
  const t = useTranslate();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-indigo-900 text-white z-30 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-indigo-800">
          <span className="text-xl font-bold tracking-wide">⚡ {t('app.name')}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, key, icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={linkClass}>
              <span>{icon}</span>
              {t(key)}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-indigo-800 text-xs text-indigo-400">
          {t('app.version')}
        </div>
      </aside>
    </>
  );
}
