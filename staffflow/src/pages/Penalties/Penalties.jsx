import { useState } from 'react';
import { usePenalty, PENALTY_TYPES } from '../../context/PenaltyContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Settings, Download } from 'lucide-react';
import { generateMonthlyReport } from '../../utils/generatePDF';

const fmt = (n) => Number(n).toLocaleString('uz-UZ') + ' UZS';
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Penalties() {
  const { penalties, config, addPenalty, removePenalty, updateConfig } = usePenalty();
  const { employees, attendance, tasks, salaries } = useApp();
  const { auth } = useAuth();

  const [filterMonth, setFilterMonth]   = useState(currentMonth());
  const [filterEmp,   setFilterEmp]     = useState('');
  const [showAdd,     setShowAdd]       = useState(false);
  const [showConfig,  setShowConfig]    = useState(false);
  const [configVal,   setConfigVal]     = useState(config.pointValue);

  // Add form state
  const [addForm, setAddForm] = useState({
    employeeId: '', type: 'MANUAL', points: -1, reason: '',
  });

  const handleDownloadPDF = () => {
    generateMonthlyReport({
      employees, attendance, tasks, salaries, penalties, config,
      month:       filterMonth,
      hrName:      auth?.name ?? 'HR Manager',
      companyName: 'StaffFlow Inc.',
    });
  };

  const filtered = penalties.filter(p =>
    (!filterMonth || p.month === filterMonth) &&
    (!filterEmp   || p.employeeId === Number(filterEmp))
  );

  const handleAdd = (e) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === Number(addForm.employeeId));
    if (!emp) return;
    addPenalty({
      employeeId:   emp.id,
      employeeName: emp.name,
      type:         addForm.type,
      points:       Number(addForm.points),
      reason:       addForm.reason,
      month:        filterMonth,
    });
    setShowAdd(false);
    setAddForm({ employeeId: '', type: 'MANUAL', points: -1, reason: '' });
  };

  const POINT_COLORS = { '-1': 'text-yellow-600', '-2': 'text-orange-600', '-3': 'text-red-600' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jarima tizimi</h1>
          <p className="text-gray-500 text-sm mt-1">
            1 ball = <span className="font-semibold text-red-600">{fmt(config.pointValue)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl text-sm hover:bg-emerald-100 transition-colors">
            <Download size={16} /> PDF yuklab olish
          </button>
          <button onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings size={16} /> Sozlash
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
            <Plus size={16} /> Jarima qo'shish
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {employees.slice(0, 4).map(emp => {
          const pts = penalties
            .filter(p => p.employeeId === emp.id && p.month === filterMonth)
            .reduce((s, p) => s + p.points, 0);
          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {emp.name[0]}
                </div>
                <p className="text-sm font-medium text-gray-700 truncate">{emp.name}</p>
              </div>
              <p className={`text-xl font-bold ${pts < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {pts} ball
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{fmt(Math.abs(pts) * config.pointValue)} jarima</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">Barcha xodimlar</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Xodim', 'Sana', 'Tur', 'Sabab', 'Ball', 'Jarima', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Jarima yozuvlari topilmadi</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{p.employeeName}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{p.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                      {PENALTY_TYPES[p.type]?.label ?? p.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">{p.reason}</td>
                  <td className={`px-5 py-3.5 font-bold ${POINT_COLORS[String(p.points)] ?? 'text-red-600'}`}>
                    {p.points}
                  </td>
                  <td className="px-5 py-3.5 text-red-600 font-medium">
                    {fmt(Math.abs(p.points) * config.pointValue)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => removePenalty(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Jarima qo'shish</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xodim</label>
                <select required value={addForm.employeeId}
                  onChange={e => setAddForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Tanlang...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tur</label>
                <select value={addForm.type}
                  onChange={e => {
                    const t = e.target.value;
                    const pts = PENALTY_TYPES[t]?.points ?? -1;
                    setAddForm(f => ({ ...f, type: t, points: pts === 0 ? -1 : pts }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {Object.entries(PENALTY_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ball (manfiy son)</label>
                <input type="number" max={-1} value={addForm.points}
                  onChange={e => setAddForm(f => ({ ...f, points: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sabab</label>
                <input type="text" value={addForm.reason} required
                  onChange={e => setAddForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Jarima sababi..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Bekor
                </button>
                <button type="submit"
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowConfig(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Jarima sozlamalari</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1 ball = (UZS)</label>
                <input type="number" value={configVal} min={1000} step={1000}
                  onChange={e => setConfigVal(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                <p>• Kech kelish (15+ daqiqa): <strong>-1 ball</strong></p>
                <p>• Vazifani kech topshirish: <strong>-2 ball</strong></p>
                <p>• Vazifani bajarmaslik: <strong>-3 ball</strong></p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfig(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Bekor
                </button>
                <button onClick={() => { updateConfig({ pointValue: configVal }); setShowConfig(false); }}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
