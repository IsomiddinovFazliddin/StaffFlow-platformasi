import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const loadAccountRoles = () => {
  try {
    const accounts = JSON.parse(localStorage.getItem('sf_accounts')) || [];
    const map = {};
    accounts.forEach(a => { map[a.email?.toLowerCase()] = a.role; });
    return map;
  } catch { return {}; }
};

const ROLE_LABELS = {
  admin:      'Admin',
  team_lead:  'Team Lead',
  employee:   'Xodim',
};

export default function MyTeam() {
  const { employees } = useApp();
  const { auth } = useAuth();

  const accountRoles = useMemo(() => loadAccountRoles(), []);

  // Find current user's employee record
  const myRecord = useMemo(() =>
    employees.find(e => e.id === auth?.employeeId || e.email?.toLowerCase() === auth?.email?.toLowerCase()),
    [employees, auth]
  );

  const myDept = myRecord?.department;

  // Team members: same department, not self, only employees
  const teammates = useMemo(() => {
    if (!myDept) return [];
    return employees.filter(e => {
      if (e.id === auth?.employeeId) return false;
      if (e.email?.toLowerCase() === auth?.email?.toLowerCase()) return false;
      if (e.department !== myDept) return false;
      const role = accountRoles[e.email?.toLowerCase()] ?? 'employee';
      return ['employee', 'team_lead'].includes(role);
    });
  }, [employees, myDept, auth, accountRoles]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Mening jamoam</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {myDept ? `Bo'lim: ${myDept}` : 'Bo\'lim tayinlanmagan'} · {teammates.length} ta hamkasb
        </p>
      </div>

      {/* My info card */}
      {myRecord && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {myRecord.name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-slate-100">{myRecord.name} <span className="text-xs text-indigo-500">(Siz)</span></p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{myRecord.role || ROLE_LABELS[auth?.role] || 'Xodim'}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">Bo'lim: {myDept || '—'}</p>
          </div>
        </div>
      )}

      {/* Teammates */}
      {teammates.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {myDept ? 'Jamoangizda boshqa xodimlar yo\'q' : 'Bo\'lim tayinlanmagan'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teammates.map(emp => {
            const role = accountRoles[emp.email?.toLowerCase()] ?? 'employee';
            return (
              <div key={emp.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  {emp.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-slate-100 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{emp.role || ROLE_LABELS[role] || 'Xodim'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${emp.status === 'Active' || emp.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {emp.status === 'Active' || emp.status === 'active' ? 'Faol' : "Ta'tilda"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
