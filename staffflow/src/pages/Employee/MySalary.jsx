import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const MONTHS_UZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const fmt = (n) => `$${Number(n).toLocaleString()}`;

// Generate monthly salary records from joinDate to now
function generateSalaryHistory(employee, salaryRecords) {
  if (!employee) return [];

  const joinDate = employee.joinDate
    ? new Date(employee.joinDate)
    : new Date();

  const now = new Date();
  const history = [];

  // Start from join month, go to current month
  const start = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth(), 1);

  let cursor = new Date(start);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth(); // 0-indexed
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const monthLabel = `${MONTHS_UZ[m]} ${y}`;

    // Find existing salary record for this month
    const existing = salaryRecords.find(s =>
      s.employeeId === employee.id && s.month === monthLabel
    );

    if (existing) {
      history.push({
        month:     monthLabel,
        date:      `${y}-${String(m + 1).padStart(2,'0')}-01`,
        base:      existing.base,
        bonus:     existing.bonus,
        deduction: existing.deductions,
        net:       existing.net,
        status:    existing.status === 'Paid' ? 'Paid' : 'Pending',
      });
    } else {
      // Auto-generate record based on employee's base salary
      const base = Number(employee.salary) || 0;
      const isCurrentMonth = y === now.getFullYear() && m === now.getMonth();
      history.push({
        month:     monthLabel,
        date:      `${y}-${String(m + 1).padStart(2,'0')}-01`,
        base,
        bonus:     0,
        deduction: 0,
        net:       base,
        status:    isCurrentMonth ? 'Pending' : 'Paid',
        auto:      true,
      });
    }

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return history.reverse(); // newest first
}

export default function MySalary() {
  const { salaries, employees } = useApp();
  const { auth } = useAuth();

  // Find employee record — match by id or email
  const employee = useMemo(() =>
    employees.find(e =>
      e.id === auth?.id ||
      e.id === auth?.employeeId ||
      String(e.id) === String(auth?.id) ||
      e.email?.toLowerCase() === auth?.email?.toLowerCase()
    ),
    [employees, auth]
  );

  // Current month salary record
  const currentSalary = useMemo(() => {
    if (!employee) return null;
    return salaries.find(s =>
      s.employeeId === employee.id || String(s.employeeId) === String(employee.id)
    ) ?? null;
  }, [salaries, employee]);

  // Full history from join date
  const history = useMemo(() =>
    generateSalaryHistory(employee, salaries),
    [employee, salaries]
  );

  const base      = currentSalary?.base      ?? Number(employee?.salary) ?? 0;
  const bonus     = currentSalary?.bonus     ?? 0;
  const deduction = currentSalary?.deductions ?? 0;
  const net       = currentSalary?.net       ?? base;

  const cards = [
    { label: 'Asosiy maosh', value: fmt(base),       color: 'text-indigo-700',  border: 'border-indigo-100',  bg: 'bg-white dark:bg-slate-800' },
    { label: 'Bonus',        value: `+${fmt(bonus)}`, color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Chegirmalar',  value: `-${fmt(deduction)}`, color: 'text-red-500', border: 'border-red-100',    bg: 'bg-white dark:bg-slate-800' },
    { label: 'Sof maosh',    value: fmt(net),         color: 'text-gray-900 dark:text-slate-100', border: 'border-gray-200 dark:border-slate-600', bg: 'bg-white dark:bg-slate-800' },
  ];

  const currentMonthLabel = `${MONTHS_UZ[new Date().getMonth()]} ${new Date().getFullYear()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Mening maoshim</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{currentMonthLabel}</p>
        {employee?.joinDate && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Qo'shilgan sana: {employee.joinDate} · Jami {history.length} oy
          </p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(({ label, value, color, border, bg }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5 text-center shadow-sm`}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">To'lovlar tarixi</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-slate-500">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm">Maosh ma'lumoti topilmadi</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-50 dark:divide-slate-700">
              {history.map((row) => (
                <div key={row.month} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{row.month}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${row.status === 'Paid'
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      {row.status === 'Paid' ? '✅ To\'landi' : '⏳ Kutilmoqda'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <div><span className="text-gray-400">Asosiy: </span><span className="font-medium text-gray-700 dark:text-slate-300">{fmt(row.base)}</span></div>
                    <div><span className="text-gray-400">Bonus: </span><span className="font-medium text-emerald-600">+{fmt(row.bonus)}</span></div>
                    <div><span className="text-gray-400">Chegirma: </span><span className="font-medium text-red-500">-{fmt(row.deduction)}</span></div>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">{row.date}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-100">{fmt(row.net)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600">
                  <tr>
                    {['Oy', 'Sana', 'Asosiy', 'Bonus', 'Chegirma', 'Sof maosh', 'Holat'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {history.map((row) => (
                    <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-slate-100">{row.month}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 font-mono text-xs">{row.date}</td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-slate-300">{fmt(row.base)}</td>
                      <td className="px-5 py-3.5 text-emerald-600 font-medium">+{fmt(row.bonus)}</td>
                      <td className="px-5 py-3.5 text-red-500 font-medium">-{fmt(row.deduction)}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-800 dark:text-slate-100">{fmt(row.net)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
                          ${row.status === 'Paid'
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                          {row.status === 'Paid' ? '✅ To\'landi' : '⏳ Kutilmoqda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
