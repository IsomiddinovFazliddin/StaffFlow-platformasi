import { useState } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { useLang } from '../../context/LangContext';
import { useUser } from '../../context/UserContext';

function SectionCard({ icon, title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
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

export default function Settings() {
  const t = useTranslate();
  const { lang, switchLang } = useLang();
  const { settings, updateSettings } = useUser();
  const [pwSaved, setPwSaved] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  const handleSavePw = (e) => {
    e.preventDefault();
    setPwSaved(true);
    setPw({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 2500);
  };

  const langs = [
    { code: 'uz', flag: '🇺🇿', label: t('settings.langUz') },
    { code: 'en', flag: '🇬🇧', label: t('settings.langEn') },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Language */}
      <SectionCard icon="🌍" title={t('settings.sectionLang')} desc={t('settings.sectionLangDesc')}>
        <div className="grid grid-cols-2 gap-3">
          {langs.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => switchLang(code)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200
                ${lang === code
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="text-2xl">{flag}</span>
              <span>{label}</span>
              {lang === code && (
                <span className="ml-auto w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard icon="🎨" title={t('settings.sectionTheme')} desc={t('settings.sectionThemeDesc')}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'light', icon: '☀️', label: t('settings.themeLight') },
            { value: 'dark',  icon: '🌙', label: t('settings.themeDark') },
          ].map(({ value, icon, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200
                ${settings.theme === value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
              {settings.theme === value && (
                <span className="ml-auto w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

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
        <form onSubmit={handleSavePw} className="space-y-3">
          {[
            { key: 'current', label: t('settings.currentPassword') },
            { key: 'next',    label: t('settings.newPassword') },
            { key: 'confirm', label: t('settings.confirmPassword') },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="password"
                value={pw[key]}
                onChange={(e) => setPw({ ...pw, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          ))}
          <button
            type="submit"
            className="mt-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {pwSaved ? t('settings.saved') : t('settings.savePassword')}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
