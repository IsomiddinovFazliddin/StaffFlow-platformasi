import { useState } from 'react';
import { useDepartments } from '../../context/DepartmentContext';
import { useApp } from '../../context/AppContext';
import { useTranslate } from '../../hooks/useTranslate';
import Button from '../../components/ui/Button';

export default function Departments() {
  const t = useTranslate();
  const { departments, addDepartment, deleteDepartment } = useDepartments();
  const { employees } = useApp();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const empCountFor = (name) => employees.filter((e) => e.department === name).length;

  const handleAdd = (e) => {
    e.preventDefault();
    const result = addDepartment(input);
    if (result.error) { setError(t(`departments.${result.errorKey}`) || result.error); return; }
    setInput('');
    setError('');
  };

  const handleDelete = (dept) => {
    const count = empCountFor(dept.name);
    if (count > 0) { setConfirmId(dept.id); return; }
    deleteDepartment(dept.id);
  };

  const forceDelete = (id) => { deleteDepartment(id); setConfirmId(null); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('departments.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('departments.subtitle', { count: departments.length })}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('departments.addTitle')}</h2>
        <form onSubmit={handleAdd} className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              placeholder={t('departments.placeholder')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
                ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <Button type="submit">{t('departments.addButton')}</Button>
        </form>
      </div>

      {departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-500 text-sm">{t('departments.empty')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[t('departments.colNumber'), t('departments.colName'), t('departments.colEmployees'), t('departments.colActions')].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.map((dept, i) => {
                const count = empCountFor(dept.name);
                return (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {dept.name[0]}
                        </div>
                        <span className="font-medium text-gray-800">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full
                        ${count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                        👥 {t('departments.employeeCount', { count })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {confirmId === dept.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-orange-600 font-medium">
                            {t('departments.confirmWarning', { count })}
                          </span>
                          <Button variant="danger" className="!py-1 !px-3 text-xs" onClick={() => forceDelete(dept.id)}>
                            {t('departments.confirmYes')}
                          </Button>
                          <Button variant="secondary" className="!py-1 !px-3 text-xs" onClick={() => setConfirmId(null)}>
                            {t('departments.confirmCancel')}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="danger" className="!py-1 !px-3 text-xs" onClick={() => handleDelete(dept)}>
                          🗑️ {t('departments.delete')}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {t('departments.total', { count: departments.length })}
          </div>
        </div>
      )}
    </div>
  );
}
