import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useDepartments } from '../../context/DepartmentContext';
import { useTranslate } from '../../hooks/useTranslate';
import Button from '../../components/ui/Button';

// ── Role options per creator role ─────────────────────────────────────────────
const CREATABLE_ROLES = {
  admin:      [{ value: 'team_lead', label: 'Team Lead' }, { value: 'employee', label: 'Xodim' }],
  team_lead:  [{ value: 'employee', label: 'Xodim' }],
};

// Department field behavior by selected role
// 'filtered' → only depts without a team_lead (team_lead role)
// 'all'      → all departments (employee role)
const DEPT_MODE = {
  team_lead: 'filtered',
  employee:  'all',
};

const EMPTY_FORM = {
  name: '', department: '', email: '',
  salary: '', status: 'Active', password: '', accountRole: 'employee', position: '',
};

export default function EmployeeModal({ onClose, employee }) {
  const t = useTranslate();
  const { addEmployee, updateEmployee, employees } = useApp();
  const { auth } = useAuth();
  const { departments } = useDepartments();

  const creatorRole = auth?.role ?? 'admin';
  const roleOptions = CREATABLE_ROLES[creatorRole] ?? CREATABLE_ROLES.admin;

  // Departments that already have a team_lead (from backend employees state)
  const deptsWithLead = useMemo(() => {
    const leadDepts = new Set(
      employees
        .filter(e => e.accountRole === 'team_lead' && e.department)
        .map(e => e.department)
    );
    return leadDepts;
  }, [employees]);

  // Init form
  const [form, setForm] = useState(() => {
    if (employee) {
      return { ...employee, password: '', accountRole: employee.accountRole ?? 'employee' };
    }
    return { ...EMPTY_FORM, accountRole: roleOptions[0]?.value ?? 'employee' };
  });
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  const deptMode = DEPT_MODE[form.accountRole] ?? 'all';
  const needsDept = true; // all roles need department

  // Departments shown in dropdown based on selected role
  const availableDepts = useMemo(() => departments, [departments]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = t('employeeModal.errorName');
    if (!form.email.trim()) e.email = t('employeeModal.errorEmail');
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('employeeModal.errorEmailInvalid');
    if (!form.salary || isNaN(form.salary) || Number(form.salary) <= 0) e.salary = t('employeeModal.errorSalary');
    if (!form.department) e.department = t('employeeModal.errorDepartment');
    if (form.accountRole === 'employee' && !form.position?.trim()) e.position = 'Lavozim kiritilishi shart';
    if (!employee && form.password && form.password.length < 6)
      e.password = 'Parol kamida 6 ta belgi bo\'lishi kerak';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cap = (v) => v.replace(/^\w/, c => c.toUpperCase());
    if (name === 'accountRole') {
      setForm(f => ({ ...f, accountRole: value, department: '' }));
    } else {
      setForm(f => ({ ...f, [name]: name === 'name' ? cap(value) : value }));
    }
    setErrors(er => ({ ...er, [name]: undefined, department: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError('');

    const deptObj = departments.find(d => d.name === form.department);
    const payload = {
      ...form,
      department:   form.department,
      departmentId: deptObj?.id || null,
      salary:       Number(form.salary),
    };

    try {
      if (employee) {
        await updateEmployee(employee.id, payload);
      } else {
        await addEmployee(payload);
      }
      onClose();
    } catch (err) {
      setApiError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const inp = (name) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
    ${errors[name] ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              {employee ? t('employeeModal.editTitle') : t('employeeModal.addTitle')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {employee ? t('employeeModal.editSubtitle') : t('employeeModal.addSubtitle')}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* 1. Ism */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldName')}</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Alice Johnson" className={inp('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* 2. Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldEmail')}</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="alice@company.com" className={inp('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* 3. Rol */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select name="accountRole" value={form.accountRole} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 4. Lavozim — only for employee role */}
            {form.accountRole === 'employee' && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lavozim <span className="text-red-500">*</span>
                </label>
                <input name="position" type="text" value={form.position || ''} onChange={handleChange}
                  placeholder="Masalan: Finance Analyst, Developer..."
                  className={inp('position')} />
                {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
              </div>
            )}

            {/* 5. Maosh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldSalary')}</label>
              <input name="salary" type="number" value={form.salary} onChange={handleChange}
                placeholder="5000" className={inp('salary')} />
              {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
            </div>

            {/* 6. Holat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldStatus')}</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="Active">{t('employeeModal.statusActive')}</option>
                <option value="On Leave">{t('employeeModal.statusOnLeave')}</option>
              </select>
            </div>

            {/* 7. Bo'lim */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('employeeModal.fieldDepartment')}
                <span className="text-red-500 ml-0.5">*</span>
              </label>

              {availableDepts.length === 0 ? (
                <div className="w-full border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700">
                  ⚠️ Hech qanday bo'lim mavjud emas.
                </div>
              ) : deptMode === 'filtered' ? (
                <select name="department" value={form.department} onChange={handleChange}
                  className={inp('department')}>
                  <option value="" disabled>— Bo'limni tanlang —</option>
                  {availableDepts.map(d => {
                    const hasLead = deptsWithLead.has(d.name);
                    return (
                      <option key={d.id} value={d.name} disabled={hasLead}>
                        {d.name}{hasLead ? ' (Team Lead bor)' : ' (Bo\'sh)'}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <select name="department" value={form.department} onChange={handleChange}
                  className={inp('department')}>
                  <option value="" disabled>— Bo'limni tanlang —</option>
                  {availableDepts.map(d => {
                    const hasLead = deptsWithLead.has(d.name);
                    return (
                      <option key={d.id} value={d.name} disabled={!hasLead}>
                        {d.name}{!hasLead ? ' (Team Lead yo\'q)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>

            {/* 8. Parol — yangi xodim uchun */}
            {!employee && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kirish paroli <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
                </label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="Kamida 6 ta belgi" className={inp('password')} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-400 mt-1">Parol kiritilsa, xodim tizimga kira oladi</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>{t('employeeModal.cancel')}</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saqlanmoqda...' : (employee
                ? t('employeeModal.save')
                : { team_lead: "Team Lead qo'shish" }[form.accountRole] ?? "Xodim qo'shish")}
            </Button>
          </div>
          {apiError && <p className="text-xs text-red-500 text-center">{apiError}</p>}
        </form>
      </div>
    </div>
  );
}
