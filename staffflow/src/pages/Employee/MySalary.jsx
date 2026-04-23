import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const fmt = (n) => `$${Number(n).toLocaleString()}`;

// Mock payment history
const PAYMENT_HISTORY = [
  { month: 'Mart 2026',   date: '2026-04-01', base: 5500, bonus: 500, deduction: 200, net: 5800, status: 'Paid' },
  { month: 'Fevral 2026', date: '2026-03-01', base: 5500, bonus: 300, deduction: 200, net: 5600, status: 'Paid' },
  { month: 'Yanvar 2026', date: '2026-02-01', base: 5500, bonus: 200, deduction: 200, net: 5500, status: 'Paid' },
  { month: 'Dekabr 2025', date: '2025-12-31', base: 5200, bonus: 400, deduction: 180, net: 5420, status: 'Paid' },
];

export default function MySalary() {
  const { salaries } = useApp();
  const { auth } = useAuth();

  const s = salaries.find((sal) => sal.employeeId === auth?.employeeId) ?? salaries[0];

  if (!s)
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">💰</p>
        <p>Maosh ma'lumoti topilmadi</p>
      </div>
    );

  const cards = [
    { label: 'Asosiy maosh', value: fmt(s.base),            color: 'text-indigo-700',  border: 'border-indigo-100', bg: 'bg-white' },
    { label: 'Bonus',        value: `+${fmt(s.bonus)}`,     color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-[#ECFDF5]' },
    { label: 'Chegirmalar',  value: `-${fmt(s.deductions)}`,color: 'text-red-500',     border: 'border-red-100',    bg: 'bg-white' },
    { label: 'Sof maosh',    value: fmt(s.net),             color: 'text-gray-900',    border: 'border-gray-200',   bg: 'bg-white' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mening maoshim</h1>
        <p className="text-gray-500 text-sm mt-1">{s.month}</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(({ label, value, color, border, bg }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5 text-center shadow-sm`}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">To'lovlar tarixi</h2>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-50">
          {PAYMENT_HISTORY.map((row) => (
            <div key={row.month} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{row.month}</p>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✅ To'landi</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div><span className="text-gray-400">Asosiy: </span><span className="font-medium text-gray-700">{fmt(row.base)}</span></div>
                <div><span className="text-gray-400">Bonus: </span><span className="font-medium text-emerald-600">+{fmt(row.bonus)}</span></div>
                <div><span className="text-gray-400">Chegirma: </span><span className="font-medium text-red-500">-{fmt(row.deduction)}</span></div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-gray-400">{row.date}</span>
                <span className="text-sm font-bold text-gray-800">{fmt(row.net)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Oy', 'Sana', 'Asosiy', 'Bonus', 'Chegirma', 'Sof maosh', 'Holat'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAYMENT_HISTORY.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{row.month}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{row.date}</td>
                  <td className="px-5 py-3.5 text-gray-700">{fmt(row.base)}</td>
                  <td className="px-5 py-3.5 text-emerald-600 font-medium">+{fmt(row.bonus)}</td>
                  <td className="px-5 py-3.5 text-red-500 font-medium">-{fmt(row.deduction)}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-800">{fmt(row.net)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      ✅ To'landi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
