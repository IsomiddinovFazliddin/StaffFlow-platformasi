import { useState } from 'react';
import { PencilLine, Trash2, RefreshCw, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../utils/mockData';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TaskModal from './TaskModal';

const STATUS_ORDER = ['Pending', 'In Progress', 'Done'];
const STATUS_UZ = { Pending: 'Kutilmoqda', 'In Progress': 'Jarayonda', Done: 'Bajarildi' };
const PRIORITY_COLORS = {
  High:   'text-red-600 bg-red-50',
  Medium: 'text-yellow-600 bg-yellow-50',
  Low:    'text-green-600 bg-green-50',
};
const PRIORITY_UZ = { High: 'Yuqori', Medium: "O'rta", Low: 'Past' };

export default function Tasks() {
  const { tasks, updateTask, deleteTask } = useApp();
  const { can, auth } = useAuth();
  const [modal, setModal]         = useState(null);
  const [filter, setFilter]       = useState('All');
  const [priority, setPriority]   = useState('All');
  const [search, setSearch]       = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const canCreate  = can(PERMISSIONS.CREATE_TASK);
  const canAssign  = can(PERMISSIONS.ASSIGN_TASK);
  const canDelete  = can(PERMISSIONS.DELETE_TASK);
  const canViewAll = can(PERMISSIONS.VIEW_ALL_TASKS);

  const cycleStatus = async (id) => {
    if (!can(PERMISSIONS.UPDATE_TASK)) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length];
    try { await updateTask(id, { status: next }); } catch { /* ignore */ }
  };

  const visibleTasks = tasks.filter(t => {
    if (!canViewAll && t.assigneeId !== auth?.employeeId) return false;
    if (filter !== 'All' && t.status !== filter) return false;
    if (priority !== 'All' && t.priority !== priority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.assignee?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    Pending:      tasks.filter(t => t.status === 'Pending').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Done:         tasks.filter(t => t.status === 'Done').length,
  };

  const statColors = {
    Pending:      { num: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-100' },
    'In Progress': { num: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100' },
    Done:         { num: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Vazifalar</h1>
          <p className="text-gray-400 text-sm mt-0.5">{visibleTasks.length} ta vazifa</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
          >
            + Vazifa qo'shish
          </button>
        )}
      </div>

      {/* ── Stat cards — 3 col on all sizes, labels wrap properly ── */}
      <div className="grid grid-cols-3 gap-3">
        {STATUS_ORDER.map(s => {
          const c = statColors[s];
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(active ? 'All' : s)}
              className={`rounded-2xl p-3 sm:p-4 text-center border transition-all
                ${active ? `${c.bg} ${c.border} ring-2 ring-offset-1 ring-current` : 'bg-white border-gray-100 hover:border-gray-200'}
              `}
            >
              <p className={`text-2xl font-bold ${c.num}`}>{counts[s]}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{STATUS_UZ[s]}</p>
            </button>
          );
        })}
      </div>

      {/* ── Filters — 2 selects side by side on mobile too ── */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="All">Barcha holat</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_UZ[s]}</option>)}
          </select>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="All">Barcha muhimlik</option>
            {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{PRIORITY_UZ[p]}</option>)}
          </select>
        </div>
      </div>

      {/* ── Task list — cards on mobile, table on md+ ── */}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {visibleTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Vazifalar topilmadi</p>
          </div>
        ) : visibleTasks.map(task => (
          <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {/* Row 1: title + priority */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm leading-snug">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                {PRIORITY_UZ[task.priority]}
              </span>
            </div>

            {/* Row 2: assignee + due */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                {task.assignee || '—'}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {task.due}
              </span>
            </div>

            {/* Row 3: status + actions */}
            <div className="flex items-center justify-between">
              <Badge label={task.status} />
              <div className="flex gap-1.5">
                {confirmId === task.id ? (
                  <>
                    <button onClick={async () => { try { await deleteTask(task.id); } catch {} setConfirmId(null); }}
                      className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-lg font-medium">Ha</button>
                    <button onClick={() => setConfirmId(null)}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">Yo'q</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => cycleStatus(task.id)} title="Holatni o'zgartir"
                      className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                      <RefreshCw size={15} strokeWidth={2} />
                    </button>
                    {(canAssign || canCreate) && (
                      <button onClick={() => setModal(task)} title="Tahrirlash"
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <PencilLine size={15} strokeWidth={2} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => setConfirmId(task.id)} title="O'chirish"
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Vazifa', "Mas'ul", 'Muhimlik', 'Muddat', 'Holat', 'Amallar'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleTasks.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <ClipboardList size={32} className="mx-auto mb-2 opacity-40" strokeWidth={1.5} /><p>Vazifalar topilmadi</p>
                </td></tr>
              ) : visibleTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{task.assignee}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_UZ[task.priority]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{task.due}</td>
                  <td className="px-5 py-4"><Badge label={task.status} /></td>
                  <td className="px-5 py-4">
                    {confirmId === task.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">O'chirilsinmi?</span>
                        <Button variant="danger" className="!py-1 !px-2 text-xs"
                          onClick={async () => { try { await deleteTask(task.id); } catch {} setConfirmId(null); }}>Ha</Button>
                        <Button variant="secondary" className="!py-1 !px-2 text-xs"
                          onClick={() => setConfirmId(null)}>Yo'q</Button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button variant="secondary" className="!py-1 !px-2 text-xs"
                          onClick={() => cycleStatus(task.id)}>
                          <RefreshCw size={13} className="inline mr-1" strokeWidth={2} />Holat
                        </Button>
                        {(canAssign || canCreate) && (
                          <Button variant="secondary" className="!py-1 !px-2 text-xs"
                            onClick={() => setModal(task)}>
                            <PencilLine size={13} strokeWidth={2} />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="danger" className="!py-1 !px-2 text-xs"
                            onClick={() => setConfirmId(task.id)}>
                            <Trash2 size={13} strokeWidth={2} />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <TaskModal
          task={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          canAssign={canAssign}
        />
      )}
    </div>
  );
}
