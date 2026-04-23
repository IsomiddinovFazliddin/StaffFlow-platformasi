import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS, salaryHistory } from '../../utils/mockData';
import Card from '../../components/ui/Card';
import SalaryModal from './SalaryModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = n => `${Number(n).toLocaleString()}`;

export default function Salary() {
  const { salaries, updateSalary } = useApp();
  const { can, auth } = useAuth();
  const [editRecord, setEditRecord] = useState(null);

  const canManage  = can(PERMISSIONS.MANAGE_SALARY);
  const canViewAll = can(PERMISSIONS.VIEW_ALL_SALARY);

  const records      = canViewAll ? salaries : salaries.filter(s => s.employeeId === auth?.employeeId);
  const totalPayroll = salaries.reduce((sum, s) => sum + s.net, 0);

  const handleSave = (id, data) => { updateSalary(id, data); setEditRecord(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maosh</h1>
          <p className="text-gray-500 text-sm mt-1">Mart 2026 ish haqi</p>
        </div>
        {canViewAll && (
          <Card className="!py-3 !px-5 text-right">
            <p className="text-xs text-gray-500">Jami ish haqi</p>
            <p className="text-xl font-bold text-indigo-700">{fmt(totalPayroll)}</p>
          </Card>
        )}
      </div>

      {/* Chart */}
      {canViewAll && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Oylik ish haqi tarixi</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={salaryHistory} barSize={40}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [fmt(v), 'Jami']} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Mobile card list ── */}
      <div className="md:hidden space-y-3">
        {records.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Ma'lumot topilmadi</p>
        ) : records.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{s.name}</p>
                <p className="text-xs text-gray-400">{s.role}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0
                ${s.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {s.status === 'Paid' ? "✅ To'landi" : '⏳ Kutilmoqda'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Asosiy</p>
                <p className="font-medium text-gray-700">{fmt(s.base)}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Bonus</p>
                <p className="font-medium text-emerald-600">+{fmt(s.bonus)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Chegirma</p>
                <p className="font-medium text-red-500">-{fmt(s.deductions)}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Sof maosh</p>
                <p className="font-bold text-indigo-700">{fmt(s.net)}</p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setEditRecord(s)}
                className="w-full text-xs py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition-colors">
                ✏️ Tahrirlash
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Xodim', 'Lavozim', 'Asosiy', 'Bonus', 'Chegirma', 'Sof maosh', 'Holat',
                  canManage ? 'Amal' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Ma'lumot topilmadi</td></tr>
              )}
              {records.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                        {s.name[0]}
                      </div>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{s.role}</td>
                  <td className="px-5 py-4 text-gray-700">{fmt(s.base)}</td>
                  <td className="px-5 py-4 text-emerald-600 font-medium">+{fmt(s.bonus)}</td>
                  <td className="px-5 py-4 text-red-500 font-medium">-{fmt(s.deductions)}</td>
                  <td className="px-5 py-4 font-bold text-indigo-700">{fmt(s.net)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full
                      ${s.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {s.status === 'Paid' ? "✅ To'landi" : '⏳ Kutilmoqda'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-4">
                      <button onClick={() => setEditRecord(s)}
                        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition-colors">
                        ✏️ Tahrir
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editRecord && (
        <SalaryModal record={editRecord} onSave={handleSave} onClose={() => setEditRecord(null)} />
      )}
    </div>
  );
}
