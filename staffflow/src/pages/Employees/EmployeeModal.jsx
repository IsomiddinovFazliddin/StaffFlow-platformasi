import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useDepartments } from '../../context/DepartmentContext';
import { useTranslate } from '../../hooks/useTranslate';
import Button from '../../components/ui/Button';

const ROLE_OPTIONS = [
  { value: 'employee',   label: 'Xodim',      needsDept: true },
  { value: 'team_lead',  label: 'Team Lead',   needsDept: true },
  { value: 'hr_manager', label: 'HR Manager',  needsDept: false },
  { value: 'admin',      label: 'Admin',       needsDept: false },
];

const EMPTY_FORM = {
  name: '', position: '', department: '', email: '',
  salary: '', status: 'Active', password: '', accountRole: 'employee',
};

export default function EmployeeModal({ onClose, employee }) {
  const t = useTranslate();
  const { addEmployee, updateEmployee } = useApp();
  const { auth, updateAuth, createAccount } = useAuth();
  const { departments } = useDepartments();

  const [form, setForm]     = useState(employee ? { ...employee, password: '', accountRole: 'employee' } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Does the selected role require a department?
  const selectedRoleMeta = ROLE_OPTIONS.find(r => r.value === (form.accountRole || 'employee'));
  const needsDept = employee ? true : (selectedRoleMeta?.needsDept ?? true);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = t('employeeModal.errorName');
    if (!form.position?.trim()) e.position = 'Lavozim kiritilishi shart';
    if (needsDept && !form.department) e.department = t('employeeModal.errorDepartment');
    if (!form.email.trim()) e.email = t('employeeModal.errorEmail');
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('employeeModal.errorEmailInvalid');
    if (!form.salary || isNaN(form.salary) || Number(form.salary) <= 0) e.salary = t('employeeModal.errorSalary');
    if (!employee && form.password && form.password.length < 6)
      e.password = 'Parol kamida 6 ta belgi bo\'lishi kerak';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cap = (v) => v.replace(/^\w/, c => c.toUpperCase());
    setForm(f => ({ ...f, [name]: ['name', 'position'].includes(name) ? cap(value) : value }));
    setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Map 'position' → 'role' for AppContext compatibility
    const payload = {
      ...form,
      role:       form.position,
      department: needsDept ? form.department : '',
      salary:     Number(form.salary),
    };

    if (employee) {
      updateEmployee(employee.id, payload);
      if (auth?.employeeId === employee.id) {
        updateAuth({ name: payload.name, email: payload.email });
      }
    } else {
      const newEmp = addEmployee(payload);
      if (form.password) {
        createAccount({
          name:       payload.name,
          email:      payload.email,
          password:   form.password,
          role:       form.accountRole || 'employee',
          employeeId: newEmp?.id ?? null,
        });
      }
    }
    onClose();
  };

  const inp = (name) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
    ${errors[name] ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
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

          {/* ── Tizim roli — YUQORIDA (Admin uchun, yangi xodim) ── */}
          {!employee && auth?.role === 'admin' && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <label className="block text-sm font-semibold text-indigo-700 mb-2">Tizim roli</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm
                      ${form.accountRole === opt.value
                        ? 'border-indigo-400 bg-indigo-100 text-indigo-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'}`}>
                    <input type="radio" name="accountRole" value={opt.value}
                      checked={form.accountRole === opt.value}
                      onChange={handleChange} className="accent-indigo-600" />
                    {opt.label}
                  </label>
                ))}
              </div>
              {!needsDept && (
                <p className="text-xs text-indigo-500 mt-2">
                  ℹ️ Bu rol uchun bo'lim tanlash shart emas
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Ism */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldName')}</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Alice Johnson" className={inp('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Lavozim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lavozim</label>
              <input name="position" type="text" value={form.position || form.role || ''} onChange={handleChange}
                placeholder="Frontend Developer" className={inp('position')} />
              {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldEmail')}</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="alice@company.com" className={inp('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Maosh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldSalary')}</label>
              <input name="salary" type="number" value={form.salary} onChange={handleChange}
                placeholder="5000" className={inp('salary')} />
              {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
            </div>

            {/* Holat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeModal.fieldStatus')}</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="Active">{t('employeeModal.statusActive')}</option>
                <option value="On Leave">{t('employeeModal.statusOnLeave')}</option>
              </select>
            </div>

            {/* Bo'lim — faqat needsDept bo'lsa */}
            {needsDept && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('employeeModal.fieldDepartment')}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                {departments.length === 0 ? (
                  <div className="w-full border border-orange-200 bg-orange-50 rounded-lg px-3 py-2 text-sm text-orange-600">
                    ⚠️ {t('employeeModal.noDepartments')}{' '}
                    <a href="/admin/departments" className="underline font-medium">{t('employeeModal.noDepartmentsLink')}</a>
                  </div>
                ) : (
                  <select name="department" value={form.department} onChange={handleChange}
                    className={inp('department')}>
                    <option value="">{t('employeeModal.selectDepartment')}</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                )}
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
            )}

            {/* Parol — faqat yangi xodim */}
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
            <Button type="submit" disabled={needsDept && departments.length === 0}>
              {employee ? t('employeeModal.save') : t('employeeModal.add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
