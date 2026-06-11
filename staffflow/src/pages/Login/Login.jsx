import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_REDIRECT = {
  admin:      '/admin',
  hr_manager: '/admin',
  team_lead:  '/admin',
  employee:   '/employee',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(ROLE_REDIRECT[result.user.role] ?? '/employee', { replace: true });
  };

  const handleGoogle = async () => {
    setError('');
    setGLoading(true);
    const result = await loginWithGoogle('login');
    setGLoading(false);

    if (!result) return; // popup yopildi — hech narsa qilma

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.pending) {
      setError('Hisobingiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.');
      return;
    }

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
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-3.5 py-2.5 rounded-xl">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || gLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-1">
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">yoki</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
          </div>

          {/* Google kirish — faqat mavjud foydalanuvchilar */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={gLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-60 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {gLoading
              ? <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              : <GoogleIcon />
            }
            {gLoading ? 'Yuklanmoqda...' : 'Google orqali kirish'}
          </button>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Hali hisobingiz yo'qmi?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">StaffFlow HRM v2.0</p>
      </div>
    </div>
  );
}
