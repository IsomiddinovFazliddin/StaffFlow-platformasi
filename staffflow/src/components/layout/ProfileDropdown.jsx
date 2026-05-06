import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  admin:      { label: 'Admin',      cls: 'bg-indigo-100 text-indigo-700' },
  hr_manager: { label: 'HR Manager', cls: 'bg-blue-100 text-blue-700' },
  team_lead:  { label: 'Team Lead',  cls: 'bg-cyan-100 text-cyan-700' },
  employee:   { label: 'Xodim',      cls: 'bg-emerald-100 text-emerald-700' },
};

const ADMIN_ROLES = ['admin', 'admin', 'team_lead'];

export default function ProfileDropdown({ open, onClose }) {
  const navigate = useNavigate();
  const { profile } = useUser();
  const { auth, logout } = useAuth();
  const ref = useRef(null);

  useClickOutside(ref, () => { if (open) onClose(); });

  if (!open) return null;

  const base = ADMIN_ROLES.includes(auth?.role) ? '/admin' : '/employee';
  const initials = (auth?.name ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roleMeta = ROLE_LABELS[auth?.role] ?? ROLE_LABELS.employee;

  const go = (path) => { onClose(); navigate(path); };
  const handleLogout = () => { onClose(); logout(); navigate('/login', { replace: true }); };

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
      style={{ maxWidth: 'calc(100vw - 16px)' }}>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
          {profile.avatar
            ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{auth?.name}</p>
          <p className="text-xs text-gray-400 truncate">{auth?.email}</p>
          <span className={`inline-block mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${roleMeta.cls}`}>
            {roleMeta.label}
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="py-1">
        <button onClick={() => go(`${base}/profile`)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <span>👤</span> Profil
        </button>
        <button onClick={() => go(`${base}/settings`)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <span>⚙️</span> Sozlamalar
        </button>
      </div>

      <div className="border-t border-gray-100 py-1">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
          <span>🚪</span> Chiqish
        </button>
      </div>
    </div>
  );
}
