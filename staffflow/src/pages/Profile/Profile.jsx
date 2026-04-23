import { useRef, useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

// ── Role meta ─────────────────────────────────────────────────────────────────
const ROLE_META = {
  admin:      { label: 'Admin',      theme: 'indigo'  },
  hr_manager: { label: 'HR Manager', theme: 'blue'    },
  team_lead:  { label: 'Team Lead',  theme: 'cyan'    },
  employee:   { label: 'Xodim',      theme: 'emerald' },
};

// ── Theme color maps ──────────────────────────────────────────────────────────
const THEME = {
  indigo:  { ring: 'ring-indigo-100',  avatar: 'bg-indigo-600',  badge: 'bg-indigo-100 text-indigo-700',  btn: 'bg-indigo-600 hover:bg-indigo-700',  icon: 'bg-indigo-50 text-indigo-600',  input: 'focus:ring-indigo-400' },
  blue:    { ring: 'ring-blue-100',    avatar: 'bg-blue-600',    badge: 'bg-blue-100 text-blue-700',      btn: 'bg-blue-600 hover:bg-blue-700',      icon: 'bg-blue-50 text-blue-600',      input: 'focus:ring-blue-400' },
  cyan:    { ring: 'ring-cyan-100',    avatar: 'bg-cyan-600',    badge: 'bg-cyan-100 text-cyan-700',      btn: 'bg-cyan-600 hover:bg-cyan-700',      icon: 'bg-cyan-50 text-cyan-600',      input: 'focus:ring-cyan-400' },
  emerald: { ring: 'ring-emerald-100', avatar: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700',btn: 'bg-emerald-600 hover:bg-emerald-700',icon: 'bg-emerald-50 text-emerald-600',input: 'focus:ring-emerald-400' },
};

// ── Role-based activity logs ──────────────────────────────────────────────────
const ROLE_ACTIVITY = {
  admin: [
    { icon: '🔑', text: 'Tizimga kirildi',                 time: '2 daqiqa oldin' },
    { icon: '👤', text: 'Profil yangilandi',                time: '1 soat oldin' },
    { icon: '🏢', text: 'Yangi bo\'lim qo\'shildi',        time: '3 soat oldin' },
    { icon: '👥', text: 'Xodim ma\'lumoti o\'zgartirildi', time: 'Kecha' },
  ],
  hr_manager: [
    { icon: '🔑', text: 'Tizimga kirildi',              time: '2 daqiqa oldin' },
    { icon: '📅', text: 'Davomat qayd etildi',           time: '30 daqiqa oldin' },
    { icon: '💰', text: 'Maosh hisoblandi',              time: '2 soat oldin' },
    { icon: '👤', text: 'Yangi xodim qo\'shildi',       time: 'Kecha' },
  ],
  team_lead: [
    { icon: '🔑', text: 'Tizimga kirildi',              time: '2 daqiqa oldin' },
    { icon: '✅', text: 'Vazifa tayinlandi',             time: '1 soat oldin' },
    { icon: '🔄', text: 'Vazifa holati yangilandi',      time: '3 soat oldin' },
    { icon: '👥', text: 'Jamoa ko\'rildi',               time: 'Kecha' },
  ],
  employee: [
    { icon: '🔑', text: 'Tizimga kirildi',              time: '2 daqiqa oldin' },
    { icon: '✅', text: 'Vazifa yakunlandi',             time: '1 soat oldin' },
    { icon: '📅', text: 'Davomat qayd etildi',           time: 'Bugun 09:02' },
    { icon: '💰', text: 'Maosh ko\'rildi',               time: 'Kecha' },
  ],
};

// ── Password change modal ─────────────────────────────────────────────────────
function PasswordModal({ onClose, theme }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg]   = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) { setMsg('Yangi parollar mos kelmadi'); return; }
    if (form.next.length < 6)       { setMsg('Parol kamida 6 ta belgi bo\'lishi kerak'); return; }
    setMsg('✅ Parol muvaffaqiyatli o\'zgartirildi');
    setTimeout(onClose, 1500);
  };

  const c = THEME[theme];
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Parolni o'zgartirish</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {[
            { name: 'current', label: 'Joriy parol' },
            { name: 'next',    label: 'Yangi parol' },
            { name: 'confirm', label: 'Yangi parolni tasdiqlang' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type="password"
                value={form[f.name]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${c.input}`}
                placeholder="••••••••"
              />
            </div>
          ))}
          {msg && <p className={`text-xs ${msg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="submit" className={`px-4 py-2 text-sm text-white rounded-lg ${c.btn}`}>
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { profile, updateProfile } = useUser();
  const { auth, updateAuth }       = useAuth();
  const { employees, updateEmployee, activityLogs } = useApp();

  const role     = auth?.role ?? 'employee';
  const meta     = ROLE_META[role] ?? ROLE_META.employee;
  const c        = THEME[meta.theme];
  const isAdmin  = role === 'admin';
  const isHR     = role === 'hr_manager';
  const isEmp    = role === 'employee';

  // Pull live employee record from AppContext (updates when Admin edits)
  const empRecord = auth?.employeeId
    ? employees.find(e => e.id === auth.employeeId)
    : null;

  const displayName  = empRecord?.name  ?? auth?.name  ?? profile.name;
  const displayEmail = auth?.email ?? profile.email;
  const displayRole  = empRecord?.role ?? meta.label;
  const displayPhone = empRecord?.phone ?? profile.phone ?? '';
  const displayDept  = empRecord?.department ?? '';

  const [form, setForm]       = useState({
    name:    displayName,
    email:   displayEmail,
    phone:   displayPhone,
    dept:    displayDept,
    // admin-only fields
    companyName: profile.companyName ?? 'StaffFlow Inc.',
    securityKey: profile.securityKey ?? '',
  });
  const [saved, setSaved]     = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const fileRef               = useRef(null);

  // Keep form in sync when auth or live employee record changes
  useEffect(() => {
    setForm(f => ({
      ...f,
      name:  empRecord?.name  ?? auth?.name  ?? f.name,
      email: auth?.email ?? f.email,
      phone: empRecord?.phone ?? f.phone,
      dept:  empRecord?.department ?? f.dept,
    }));
  }, [auth?.id, empRecord?.name, empRecord?.phone, empRecord?.department]);

  const initials = displayName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    // 1. UserContext — avatar, companyName kabi qo'shimcha maydonlar
    updateProfile({ ...form, role: displayRole });
    // 2. AuthContext — Navbar darhol yangilanadi + localStorage sf_auth
    updateAuth({ name: form.name, email: form.email });
    // 3. AppContext employees — sahifa yangilanganda ham saqlanadi
    if (auth?.employeeId) {
      updateEmployee(auth.employeeId, {
        name:  form.name,
        email: form.email,
        phone: form.phone,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateProfile({ avatar: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const activity = ROLE_ACTIVITY[role] ?? ROLE_ACTIVITY.employee;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Profil</h1>
        <p className="text-sm text-gray-400 mt-0.5">Shaxsiy ma'lumotlaringizni boshqaring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className={`w-24 h-24 rounded-full ${c.avatar} flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ${c.ring}`}>
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className={`absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center ${c.icon} hover:opacity-80 transition-opacity shadow-sm`}
                title="Rasm yuklash"
              >
                {/* Camera icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>

            <p className="font-semibold text-gray-800">{displayName}</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full mt-1 ${c.badge}`}>{meta.label}</span>
            {displayDept && <p className="text-xs text-gray-400 mt-1">{displayDept}</p>}
            <p className="text-xs text-gray-400 mt-0.5">{displayEmail}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 w-full text-xs text-gray-400">
              A'zo bo'lgan sana: Yanvar 2024
            </div>
          </div>

          {/* Activity log */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">So'nggi faoliyat</h3>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full ${c.icon} flex items-center justify-center text-sm shrink-0`}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{a.text}</p>
                    <p className="text-xs text-gray-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: edit form ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-lg">✏️</span>
              <h2 className="text-sm font-semibold text-gray-800">Ma'lumotlarni tahrirlash</h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">

              {/* Name — readonly */}
              <div>
                <label className="block text-sm font-medium text-[#18181B] mb-1">To'liq ism</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  readOnly={isEmp}
                  disabled={isEmp}
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
                    ${isEmp
                      ? 'bg-[#F4F4F5] text-gray-500 cursor-not-allowed'
                      : `focus:ring-emerald-400 focus:border-emerald-400`}`}
                  placeholder="Ismingizni kiriting"
                />
                {isEmp && <p className="text-xs text-[#71717A] mt-1">Ismni faqat HR o'zgartira oladi</p>}
              </div>

              {/* Role — always readonly */}
              <div>
                <label className="block text-sm font-medium text-[#18181B] mb-1">Lavozim</label>
                <input
                  value={displayRole}
                  readOnly
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F4F4F5] text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-[#71717A] mt-1">Lavozimni faqat HR o'zgartira oladi</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#18181B] mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                  placeholder="email@misol.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#18181B] mb-1">Telefon raqam</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                  placeholder="+998 90 000 00 00"
                />
              </div>

              {/* Admin-only: company settings + security key */}
              {(isAdmin || isHR) && (
                <div className="pt-2 border-t border-gray-100 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isAdmin ? 'Kompaniya sozlamalari' : 'HR sozlamalari'}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-[#18181B] mb-1">Kompaniya nomi</label>
                    <input
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                      placeholder="Kompaniya nomini kiriting"
                    />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-[#18181B] mb-1">Xavfsizlik kaliti (API Key)</label>
                      <input
                        name="securityKey"
                        value={form.securityKey}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                        placeholder="sk-••••••••••••••••"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {saved ? '✓ Saqlandi' : 'O\'zgarishlarni saqlash'}
                </button>

                <button
                  type="button"
                  onClick={() => setPwModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 font-medium bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Parolni o'zgartirish
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Password modal */}
      {pwModal && <PasswordModal onClose={() => setPwModal(false)} theme={meta.theme} />}
    </div>
  );
}
