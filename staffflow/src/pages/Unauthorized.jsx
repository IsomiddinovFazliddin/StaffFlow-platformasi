import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  admin:      '/admin',
  hr_manager: '/admin',
  team_lead:  '/admin',
  employee:   '/employee',
};

export default function Unauthorized() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const home = ROLE_HOME[auth?.role] ?? '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-4xl font-black text-red-500 mb-1">403</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Ruxsat yo'q</h1>
        <p className="text-gray-500 text-sm mb-6">
          Bu sahifaga kirishga ruxsatingiz yo'q.<br />
          {auth ? `Sizning rolingiz: ${auth.role}` : 'Tizimga kiring.'}
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(home, { replace: true })}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
          {auth && (
            <button
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
            >
              Boshqa hisob bilan kirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
