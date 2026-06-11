import { useState } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';

function SectionCard({ icon, title, desc, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">{title}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none
        ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300
        ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ── Password form with eye toggle ─────────────────────────────────────────────
function PasswordForm() {
  const t = useTranslate();
  const { changePassword } = useAuth();
  const [pw,      setPw]      = useState({ current: '', next: '', confirm: '' });
  const [show,    setShow]    = useState({ current: false, next: false, confirm: false });
  const [msg,     setMsg]     = useState('');
  const [saved,   setSaved]   = useState(false);

  const toggle = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    if (pw.next !== pw.confirm) { setMsg('Yangi parollar mos kelmadi'); return; }
    const result = await changePassword(pw.current, pw.next);
    if (result.error) { setMsg(result.error); return; }
    setSaved(true);
    setPw({ current: '', next: '', confirm: '' });
    setTimeout(() => setSaved(false), 2500);
  };

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => toggle(field)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
      {show[field] ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  const fields = [
    { key: 'current', label: t('settings.currentPassword') },
    { key: 'next',    label: t('settings.newPassword') },
    { key: 'confirm', label: t('settings.confirmPassword') },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-3">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">{label}</label>
          <div className="relative">
            <input
              type={show[key] ? 'text' : 'password'}
              value={pw[key]}
              onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="••••••••"
            />
            <EyeBtn field={key} />
          </div>
        </div>
      ))}
      {msg && <p className="text-xs text-red-500 dark:text-red-400">{msg}</p>}
      <button type="submit"
        className="mt-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
        {saved ? '✓ ' + t('settings.saved') : t('settings.savePassword')}
      </button>
    </form>
  );
}

export default function Settings() {
  const t = useTranslate();
  const { settings, updateSettings } = useUser();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Notifications */}
      <SectionCard icon="🔔" title={t('settings.sectionNotif')} desc={t('settings.sectionNotifDesc')}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">{t('settings.notifEnable')}</span>
          <Toggle
            checked={settings.notifications}
            onChange={(val) => updateSettings({ notifications: val })}
          />
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard icon="🔐" title={t('settings.sectionSecurity')} desc={t('settings.sectionSecurityDesc')}>
        <PasswordForm />
      </SectionCard>
    </div>
  );
}
