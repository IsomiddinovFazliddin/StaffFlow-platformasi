import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const isFirstUser = () => {
  try {
    const accounts = JSON.parse(localStorage.getItem('sf_accounts')) || [];
    return accounts.length === 0;
  } catch { return true; }
};

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const firstUser = isFirstUser();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim())  return setError('Ism kiritilishi shart');
    if (!form.email.trim()) return setError('Email kiritilishi shart');
    if (form.password.length < 6) return setError('Parol kamida 6 ta belgi bo\'lishi kerak');
    if (form.password !== form.confirm) return setError('Parollar mos kelmadi');

    setLoading(true);
    const result = register({ name: form.name, email: form.email, password: form.password });
    setLoading(false);

    if (result.error) return setError(result.error);

    const role = result.user.role;
    navigate(['admin', 'hr_manager', 'team_lead'].includes(role) ? '/admin' : '/employee', { replace: true });
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/40">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">StaffFlow HRM</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Yangi hisob yaratish</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">To'liq ism</label>
              <input type="text" value={form.name} onChange={set('name')}
                placeholder="Ismingizni kiriting" required className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="email@staffflow.com" required className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Parol</label>
              <input type="password" value={form.password} onChange={set('password')}
                placeholder="Kamida 6 ta belgi" required className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Parolni tasdiqlang</label>
              <input type="password" value={form.confirm} onChange={set('confirm')}
                placeholder="Parolni qayta kiriting" required className={inputCls} />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3.5 py-2.5 rounded-xl">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* First user hint */}
            <div className={`text-xs px-3.5 py-2.5 rounded-xl border ${
              firstUser
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
            }`}>
              {firstUser
                ? '💡 Siz birinchi foydalanuvchisiz — avtomatik Admin rolini olasiz.'
                : 'ℹ️ Yangi hisob Xodim sifatida yaratiladi. Admin tomonidan rol o\'zgartirilishi mumkin.'}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-1">
              {loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Kirish
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">StaffFlow HRM v2.0</p>
      </div>
    </div>
  );
}
