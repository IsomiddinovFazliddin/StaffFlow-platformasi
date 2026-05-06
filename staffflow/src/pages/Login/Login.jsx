import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['admin', 'admin', 'team_lead'];

const ROLE_REDIRECT = {
  admin:      '/admin',
  hr_manager: '/admin',
  team_lead:  '/admin',
  employee:   '/employee',
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(ROLE_REDIRECT[result.user.role] ?? '/employee', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/40">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">StaffFlow HRM</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tizimga kirish</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@staffflow.com" required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Parol</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Parolni kiriting" required
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors" />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3.5 py-2.5 rounded-xl">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-1">
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Hali hisobingiz yo'qmi?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </div>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Barcha hisoblar o\'chiriladi va qayta ro\'yxatdan o\'tishingiz kerak bo\'ladi. Davom etasizmi?')) {
                  localStorage.removeItem('sf_accounts');
                  localStorage.removeItem('sf_auth');
                  window.location.href = '/register';
                }
              }}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors">
              Parolni unutdingizmi? Tizimni tiklash
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">StaffFlow HRM v2.0</p>
      </div>
    </div>
  );
}
