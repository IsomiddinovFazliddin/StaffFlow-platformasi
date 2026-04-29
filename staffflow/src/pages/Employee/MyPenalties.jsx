import { useAuth } from '../../context/AuthContext';
import { usePenalty, PENALTY_TYPES } from '../../context/PenaltyContext';
import { useApp } from '../../context/AppContext';

const fmt = (n) => Number(n).toLocaleString('uz-UZ') + ' UZS';
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function MyPenalties() {
  const { auth } = useAuth();
  const { getEmployeePenalties, getEmployeePoints, getDeduction, config } = usePenalty();
  const { employees } = useApp();

  const emp = employees.find(e => e.id === auth?.employeeId);
  const month = currentMonth();
  const myPenalties = getEmployeePenalties(auth?.employeeId, month);
  const totalPoints = getEmployeePoints(auth?.employeeId, month);
  const deduction   = getDeduction(auth?.employeeId, month);

  const baseSalary = emp?.salary ?? 0;
  const netSalary  = Math.max(0, baseSalary - deduction);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mening jarimalarim</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className={`text-3xl font-bold ${totalPoints < 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {totalPoints}
          </p>
          <p className="text-xs text-gray-500 mt-1">Minus ballar</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-red-600">{fmt(deduction)}</p>
          <p className="text-xs text-gray-500 mt-1">Qirqiladigan summa</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-emerald-700">${netSalary.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Sof maosh</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
        <p className="font-semibold mb-1">Jarima qoidalari:</p>
        <ul className="space-y-0.5 text-xs">
          <li>• Kech kelish (15+ daqiqa): <strong>-1 ball</strong> = {fmt(config.pointValue)}</li>
          <li>• Vazifani kech topshirish: <strong>-2 ball</strong> = {fmt(config.pointValue * 2)}</li>
          <li>• Vazifani bajarmaslik: <strong>-3 ball</strong> = {fmt(config.pointValue * 3)}</li>
        </ul>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Bu oygi jarima tarixi</h2>
        </div>
        {myPenalties.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm">Bu oyda jarima yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myPenalties.map(p => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {PENALTY_TYPES[p.type]?.label ?? p.type} · {p.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{p.points} ball</p>
                  <p className="text-xs text-gray-400">{fmt(Math.abs(p.points) * config.pointValue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
