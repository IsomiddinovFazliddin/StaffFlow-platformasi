import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';

const STATUS_ORDER = ['Pending', 'In Progress', 'Done'];

const PRIORITY_COLORS = {
  High:   'text-red-600 bg-red-50',
  Medium: 'text-yellow-600 bg-yellow-50',
  Low:    'text-green-600 bg-green-50',
};

const PRIORITY_UZ = { High: 'Yuqori', Medium: "O'rta", Low: 'Past' };

const STATUS_OPTIONS = [
  { value: 'Pending',     label: 'Kutilmoqda', dot: 'bg-yellow-400' },
  { value: 'In Progress', label: 'Jarayonda',  dot: 'bg-blue-500' },
  { value: 'Done',        label: 'Bajarildi',  dot: 'bg-emerald-500' },
];

const STATUS_SELECT_COLORS = {
  Pending:      'border-yellow-300 text-yellow-700 bg-yellow-50',
  'In Progress':'border-blue-300   text-blue-700   bg-blue-50',
  Done:         'border-emerald-300 text-emerald-700 bg-emerald-50',
};

function StatusSelect({ status, onChange }) {
  return (
    <div className="relative inline-flex items-center">
      {/* colored dot */}
      <span className={`absolute left-2.5 w-2 h-2 rounded-full shrink-0 pointer-events-none
        ${STATUS_OPTIONS.find(o => o.value === status)?.dot ?? 'bg-gray-400'}`}
      />
      <select
        value={status}
        onChange={e => onChange(e.target.value)}
        className={`pl-6 pr-6 py-1.5 text-xs font-semibold rounded-md border appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 transition-colors
          ${STATUS_SELECT_COLORS[status] ?? 'border-gray-200 text-gray-600 bg-white'}`}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {/* chevron */}
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-1.5 w-3 h-3 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function MyTasks() {
  const { tasks, updateTask } = useApp();
  const { auth } = useAuth();

  const myTasks = tasks.filter((t) => t.assigneeId === auth?.employeeId);

  const handleStatusChange = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  const statColors = {
    Pending:       { num: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-100', label: 'Kutilmoqda' },
    'In Progress': { num: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100',   label: 'Jarayonda' },
    Done:          { num: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100',label: 'Bajarildi' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mening vazifalarim</h1>
        <p className="text-gray-500 text-sm mt-1">{myTasks.length} ta vazifa</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_ORDER.map((s) => {
          const c = statColors[s];
          return (
            <div key={s} className={`${c.bg} border ${c.border} rounded-2xl p-4 text-center shadow-sm`}>
              <p className={`text-2xl font-bold ${c.num}`}>{myTasks.filter((t) => t.status === s).length}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">Hozircha vazifa yo'q</p>
          </div>
        ) : myTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                {PRIORITY_UZ[task.priority]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>📅 {task.due}</span>
              </div>
              <Badge label={task.status} />
            </div>
            <div className="flex justify-end pt-1">
              <StatusSelect status={task.status} onChange={(val) => handleStatusChange(task.id, val)} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Vazifa', 'Muhimlik', 'Muddat', 'Holat', 'Amal'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">📋</p>
                    <p>Hozircha vazifa yo'q</p>
                  </td>
                </tr>
              ) : myTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_UZ[task.priority]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{task.due}</td>
                  <td className="px-5 py-4"><Badge label={task.status} /></td>
                  <td className="px-5 py-4">
                    <StatusSelect status={task.status} onChange={(val) => handleStatusChange(task.id, val)} />
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
