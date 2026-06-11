import { useState, useEffect, useMemo } from 'react';
import { Search, PencilLine, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslate } from '../../hooks/useTranslate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmployeeModal from './EmployeeModal';

const ROLE_META = {
  admin:      { label: 'Admin',      cls: 'bg-red-100 text-red-700' },
  hr_manager: { label: 'HR Manager', cls: 'bg-blue-100 text-blue-700' },
  team_lead:  { label: 'Team Lead',  cls: 'bg-amber-100 text-amber-700' },
  employee:   { label: 'Xodim',      cls: 'bg-gray-100 text-gray-600' },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] ?? ROLE_META.employee;
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function DeleteConfirmModal({ employee, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" strokeWidth={2} />
          </div>
          <h2 className="text-base font-semibold text-gray-800">Xodimni o'chirish</h2>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-semibold text-gray-800">{employee.name}</span> o'chirilmoqda.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Ushbu xodimga tegishli barcha ma'lumotlar o'chib ketadi. Ishonchingiz komilmi?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>Bekor qilish</Button>
          <Button variant="danger"    className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? 'O\'chirilmoqda...' : 'Ha, o\'chirish'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-xl">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

export default function Employees() {
  const t = useTranslate();
  const { employees, deleteEmployee, loading } = useApp();
  const { auth } = useAuth();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [search,       setSearch]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(false);

  // Role-based visibility filter — admin hech qachon ko'rinmaydi
  const visibleEmployees = useMemo(() => {
    const role = auth?.role;
    // Admin hech qachon xodim ro'yxatida ko'rinmaydi
    const nonAdmins = employees.filter(e => e.accountRole !== 'admin' && e.role !== 'admin');
    if (role === 'admin') return nonAdmins;
    if (role === 'team_lead') {
      const leadEmp = nonAdmins.find(e => e.id === auth?.employeeId || e.id === auth?.id);
      const dept = leadEmp?.department || auth?.department;
      return nonAdmins.filter(e => e.accountRole === 'employee' && (!dept || e.department === dept));
    }
    return nonAdmins.filter(e => e.id === auth?.id);
  }, [employees, auth]);

  const filtered = visibleEmployees.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (emp) => { setEditTarget(emp); setModalOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setToast(true);
    } catch { /* ignore */ }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const deptDisplay = (emp) => emp.department || '—';

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('employees.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('employees.subtitle', { filtered: filtered.length, total: visibleEmployees.length })}
          </p>
        </div>
        {auth?.role === 'admin' && (
          <Button onClick={openAdd}>{t('employees.addEmployee')}</Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
        <input type="text" placeholder={t('employees.searchPlaceholder')}
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        )}
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search size={32} className="mx-auto mb-2 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">{t('employees.notFound', { search })}</p>
          </div>
        ) : filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                {emp.name[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{emp.name}</p>
                <p className="text-xs text-gray-400 truncate">{emp.email}</p>
              </div>
              <div className="ml-auto shrink-0"><Badge label={emp.status} /></div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <RoleBadge role={emp.accountRole} />
              {deptDisplay(emp) !== '—' && (
                <span className="text-xs text-gray-500">{deptDisplay(emp)}</span>
              )}
              <span className="text-xs text-gray-500 ml-auto">${emp.salary?.toLocaleString() ?? '—'}</span>
            </div>
            {auth?.role === 'admin' && (
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" className="flex-1 !py-1.5 text-xs" onClick={() => openEdit(emp)}>
                  <PencilLine size={13} className="inline mr-1" strokeWidth={2} />{t('employees.edit')}
                </Button>
                <Button variant="danger" className="flex-1 !py-1.5 text-xs" onClick={() => setDeleteTarget(emp)}>
                  <Trash2 size={13} className="inline mr-1" strokeWidth={2} />{t('employees.delete')}
                </Button>
              </div>
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
                {['Xodim', 'Rol', "Bo'lim", 'Maosh', 'Holat',
                  auth?.role === 'admin' ? 'Amallar' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Search size={32} className="mx-auto mb-2 opacity-40" strokeWidth={1.5} />
                    <p className="text-sm">{t('employees.notFound', { search })}</p>
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RoleBadge role={emp.accountRole} /></td>
                  <td className="px-6 py-4 text-gray-600">{deptDisplay(emp)}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">${emp.salary?.toLocaleString() ?? '—'}</td>
                  <td className="px-6 py-4"><Badge label={emp.status} /></td>
                  {auth?.role === 'admin' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(emp)} title="Tahrirlash"
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <PencilLine size={15} className="text-gray-600" strokeWidth={2} />
                        </button>
                        <button onClick={() => setDeleteTarget(emp)} title="O'chirish"
                          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors">
                          <Trash2 size={15} className="text-white" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {t('employees.showing', { count: filtered.length })}
          </div>
        )}
      </div>

      {modalOpen && <EmployeeModal onClose={() => setModalOpen(false)} employee={editTarget} />}

      {deleteTarget && (
        <DeleteConfirmModal
          employee={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {toast && <Toast message="Xodim muvaffaqiyatli o'chirildi" onDone={() => setToast(false)} />}
    </div>
  );
}
