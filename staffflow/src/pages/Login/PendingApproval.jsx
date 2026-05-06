import { Link } from 'react-router-dom';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tasdiqlash kutilmoqda</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Hisobingiz muvaffaqiyatli yaratildi.<br />
          <strong>Admin tasdiqlaguncha kuting.</strong><br />
          Tasdiqlangandan so'ng tizimga kira olasiz.
        </p>
        <Link to="/login"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
          Kirish sahifasiga qaytish
        </Link>
      </div>
    </div>
  );
}
