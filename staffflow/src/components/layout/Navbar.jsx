import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import Logo from '../ui/Logo';

const PANELS = { none: 'none', notifications: 'notifications', profile: 'profile' };

const ROLE_COLORS = {
  admin:      'bg-indigo-600',
  hr_manager: 'bg-blue-600',
  team_lead:  'bg-cyan-600',
  employee:   'bg-emerald-600',
};

const ROLE_LABELS = {
  admin:      'Admin',
  hr_manager: 'HR Manager',
  team_lead:  'Team Lead',
  employee:   'Xodim',
};

export default function Navbar({ onMenuClick, collapsed, onToggleCollapse }) {
  const { profile } = useUser();
  const { auth } = useAuth();
  const { employees } = useApp();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(PANELS.none);

  const toggle   = (panel) => setOpen(prev => prev === panel ? PANELS.none : panel);
  const closeAll = () => setOpen(PANELS.none);

  // Use live employee name if available (updates when Admin edits employee)
  const liveEmployee = auth?.employeeId ? employees?.find(e => e.id === auth.employeeId) : null;
  const displayName = liveEmployee?.name ?? auth?.name ?? '';

  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const avatarBg = ROLE_COLORS[auth?.role] ?? 'bg-indigo-600';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2">

        {/* ── Desktop collapse toggle (lg+) ── */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-transparent hover:bg-gray-100 transition-colors duration-200"
          aria-label="Sidebar yopish/ochish"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
            }
          </svg>
        </button>

        {/* ── Mobile/tablet hamburger (< lg) ── */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo — sidebar ko'rinmagan holatlarda (< lg) */}
        <div className="lg:hidden">
          <Logo variant="light" />
        </div>

      </div>

      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => toggle(PANELS.notifications)}
            className={`relative p-2.5 rounded-xl transition-colors
              ${open === PANELS.notifications ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown open={open === PANELS.notifications} onClose={closeAll} />
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => toggle(PANELS.profile)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors
              ${open === PANELS.profile ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
          >
            <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden`}>
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">{displayName}</p>
              <p className="text-xs text-gray-400 leading-tight">{ROLE_LABELS[auth?.role] ?? auth?.role}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200 ${open === PANELS.profile ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ProfileDropdown open={open === PANELS.profile} onClose={closeAll} />
        </div>
      </div>
    </header>
  );
}
