import { useState, useMemo } from 'react';
import { useDepartments } from '../../context/DepartmentContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslate } from '../../hooks/useTranslate';
import { Trash2, Crown, Users, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// ── Load account roles ────────────────────────────────────────────────────────
const loadAccountRoles = () => {
  try {
    const accounts = JSON.parse(localStorage.getItem('sf_accounts')) || [];
    const map = {};
    accounts.forEach(a => { map[a.email?.toLowerCase()] = a.role; });
    return map;
  } catch { return {}; }
};

// ── Employee detail modal ─────────────────────────────────────────────────────
function EmployeeDetailModal({ employee, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Xodim ma'lumotlari</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
            {employee.name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{employee.name}</p>
            <p className="text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
        <div className="space-y-2.5 text-sm">
          {[
            { label: 'Bo\'lim',    value: employee.department || '—' },
            { label: 'Maosh',     value: employee.salary ? `$${Number(employee.salary).toLocaleString()}` : '—' },
            { label: 'Telefon',   value: employee.phone || '—' },
            { label: 'Qo\'shilgan', value: employee.joinDate || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Holat</span>
            <Badge label={employee.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Department card ───────────────────────────────────────────────────────────
function DeptCard({ dept, lead, deptEmps, canManage, onDelete, onConfirmDelete, isConfirm, onCancelConfirm }) {
  const [expanded, setExpanded] = useState(false);
  const [detailEmp, setDetailEmp] = useState(null);
  const hasLead = !!lead;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm flex flex-col
      ${!hasLead ? 'border-amber-200' : 'border-gray-100'}`}>

      {/* Warning: no lead */}
      {!hasLead && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-0 text-xs text-amber-600">
          <AlertCircle size={13} strokeWidth={2} />
          <span>Bo'lim boshlig'i tayinlanmagan</span>
        </div>
      )}

      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
            {dept.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{dept.name}</h3>
            <p className="text-xs text-gray-400">{deptEmps.length} ta xodim</p>
          </div>
        </div>

        {/* Team Lead */}
        <div className="flex items-center gap-2 py-2 border-t border-gray-50">
          <Crown size={14} className={hasLead ? 'text-amber-500' : 'text-gray-300'} strokeWidth={2} />
          <span className="text-xs text-gray-500">Bo'lim boshlig'i:</span>
          {hasLead ? (
            <button onClick={() => setDetailEmp(lead)}
              className="text-xs font-semibold text-indigo-600 hover:underline truncate">
              {lead.name}
            </button>
          ) : (
            <span className="text-xs text-amber-500 font-medium italic">Tayinlanmagan</span>
          )}
        </div>

        {/* Employees count + expand */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between py-2 border-t border-gray-50 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
          <div className="flex items-center gap-1.5">
            <Users size={13} strokeWidth={2} />
            <span>{deptEmps.length > 0 ? `${deptEmps.length} ta xodim` : 'Xodim yo\'q'}</span>
          </div>
          {deptEmps.length > 0 && (
            expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          )}
        </button>

        {/* Employees list — expandable */}
        {expanded && deptEmps.length > 0 && (
          <div className="mt-1 space-y-1.5 border-t border-gray-50 pt-2">
            {deptEmps.map(emp => (
              <button key={emp.id} onClick={() => setDetailEmp(emp)}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-indigo-50 transition-colors text-left">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                  {emp.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{emp.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{emp.email}</p>
                </div>
                <Badge label={emp.status} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {canManage && (
        <div className="px-5 pb-5 mt-auto">
          {isConfirm ? (
            <div className="space-y-2">
              <p className="text-xs text-orange-600 font-medium text-center">
                {deptEmps.length > 0
                  ? `${deptEmps.length} ta xodim bo'limdan chiqariladi. Davom etasizmi?`
                  : 'Bo\'limni o\'chirishni tasdiqlaysizmi?'}
              </p>
              <div className="flex gap-2">
                <button onClick={() => onDelete(dept.id)}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-xl transition-colors">
                  Ha, o'chirish
                </button>
                <button onClick={onCancelConfirm}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Bekor
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => onConfirmDelete(dept)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors">
              <Trash2 size={15} strokeWidth={2} />
              O'chirish
            </button>
          )}
        </div>
      )}

      {/* Employee detail modal */}
      {detailEmp && <EmployeeDetailModal employee={detailEmp} onClose={() => setDetailEmp(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Departments() {
  const t = useTranslate();
  const { departments, addDepartment, deleteDepartment } = useDepartments();
  const { employees } = useApp();
  const { auth } = useAuth();

  const [input,     setInput]     = useState('');
  const [error,     setError]     = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const role = auth?.role;
  const canManage = role === 'admin' || role === 'hr_manager';

  const accountRoles = useMemo(() => loadAccountRoles(), []);

  const enriched = useMemo(() =>
    employees.map(e => ({
      ...e,
      accountRole: accountRoles[e.email?.toLowerCase()] ?? 'employee',
    })),
    [employees, accountRoles]
  );

  // Team Lead sees only their own department
  const visibleDepts = useMemo(() => {
    if (role === 'team_lead') {
      const leadEmp = enriched.find(e => e.id === auth?.employeeId);
      const dept = leadEmp?.department;
      return dept ? departments.filter(d => d.name === dept) : [];
    }
    return departments;
  }, [departments, enriched, role, auth?.employeeId]);

  const getTeamLead = (deptName) =>
    enriched.find(e => e.accountRole === 'team_lead' && e.department === deptName);

  const getDeptEmployees = (deptName) =>
    enriched.filter(e => e.accountRole === 'employee' && e.department === deptName);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) { setError('Bo\'lim nomi kiritilishi shart'); return; }
    const result = addDepartment(input.trim());
    if (result?.error) { setError(t(`departments.${result.errorKey}`) || result.error); return; }
    setInput('');
    setError('');
  };

  const handleConfirmDelete = (dept) => setConfirmId(dept.id);
  const handleDelete = (id) => { deleteDepartment(id); setConfirmId(null); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('departments.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {visibleDepts.length} ta bo'lim
        </p>
      </div>

      {/* Add form */}
      {canManage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Yangi bo'lim qo'shish</h2>
          <form onSubmit={handleAdd} className="flex gap-3 items-start">
            <div className="flex-1">
              <input type="text" value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                placeholder="Bo'lim nomi (masalan: Marketing)"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
                  ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`}
              />
            </div>
            <Button type="submit">Qo'shish</Button>
          </form>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {/* Cards grid */}
      {visibleDepts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-500 text-sm">{t('departments.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {visibleDepts.map(dept => (
            <DeptCard
              key={dept.id}
              dept={dept}
              lead={getTeamLead(dept.name)}
              deptEmps={getDeptEmployees(dept.name)}
              canManage={canManage}
              onDelete={handleDelete}
              onConfirmDelete={handleConfirmDelete}
              isConfirm={confirmId === dept.id}
              onCancelConfirm={() => setConfirmId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
