import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDepartments } from '../../context/DepartmentContext';
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, Clock, User, Loader2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'employee',  label: 'Xodim' },
  { value: 'team_lead', label: 'Team Lead' },
];

function ApprovalModal({ user, departments, onApprove, onReject, onClose, loading }) {
  const [deptId, setDeptId] = useState('');
  const [role,   setRole]   = useState('employee');
  const [error,  setError]  = useState('');

  const handleApprove = () => {
    if (!deptId) { setError("Bo'lim tanlash majburiy"); return; }
    const dept = departments.find(d => d.id === deptId);
    onApprove(user._id || user.id, { department: dept?.name || '', role, departmentId: deptId });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Bo'lim biriktir va tasdiqlash
        </h2>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
            {user.name?.[0] || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Bo'lim <span className="text-red-500">*</span>
            </label>
            <select value={deptId} onChange={e => { setDeptId(e.target.value); setError(''); }}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">— Bo'limni tanlang —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={() => onReject(user._id || user.id)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
            <XCircle size={15} /> Rad etish
          </button>
          <button onClick={handleApprove} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingApprovals() {
  const { getPendingUsers, approveUser, rejectUser } = useAuth();
  const { departments } = useDepartments();
  const { refetch } = useApp();

  const [pending,  setPending]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  const loadPending = useCallback(async () => {
    setFetching(true);
    const list = await getPendingUsers();
    setPending(list);
    setFetching(false);
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (userId, { department, role, departmentId }) => {
    setLoading(true);
    const result = await approveUser(userId, { department, role, departmentId });
    setLoading(false);
    if (result.error) { showToast(result.error, 'error'); return; }
    setSelected(null);
    await loadPending();
    // Employees listini yangilash
    try { await refetch(); } catch { /* ignore */ }
    showToast('Foydalanuvchi tasdiqlandi');
  };

  const handleReject = async (userId) => {
    setLoading(true);
    const user = pending.find(u => (u._id || u.id) === userId);
    const result = await rejectUser(userId);
    setLoading(false);
    if (result.error) { showToast(result.error, 'error'); return; }
    setSelected(null);
    await loadPending();
    showToast(`${user?.name || 'Foydalanuvchi'} rad etildi`, 'error');
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Tasdiqlash kutayotganlar</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {pending.length} ta foydalanuvchi tasdiqlash kutmoqda
        </p>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center">
          <CheckCircle size={40} className="mx-auto mb-3 text-emerald-400 opacity-60" strokeWidth={1.5} />
          <p className="text-gray-500 dark:text-slate-400 text-sm">Tasdiqlash kutayotgan foydalanuvchilar yo'q</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600">
                <tr>
                  {['Foydalanuvchi', "Ro'yxatdan o'tgan", 'Holat', 'Amal'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {pending.map(u => (
                  <tr key={u._id || u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-slate-100">{u.name}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-slate-400 text-xs font-mono">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                        <Clock size={11} /> Kutilmoqda
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors">
                        <User size={13} /> Ko'rib chiqish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <ApprovalModal
          user={selected}
          departments={departments}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelected(null)}
          loading={loading}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
