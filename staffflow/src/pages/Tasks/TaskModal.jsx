import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';

const EMPTY = { title: '', description: '', assigneeId: '', assignee: '', priority: 'Medium', status: 'Pending', due: '' };

export default function TaskModal({ task, onClose, canAssign }) {
  const { employees, addTask, updateTask } = useApp();
  const [form, setForm] = useState(task ? { ...task } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Sarlavha majburiy';
    if (!form.due) e.due = 'Muddat majburiy';
    if (canAssign && !form.assigneeId) e.assigneeId = 'Mas\'ulni tanlang';
    return e;
  };

  const cap = (v) => v.replace(/^\w/, c => c.toUpperCase());

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'assigneeId') {
      const emp = employees.find(em => em.id === Number(value));
      setForm(f => ({ ...f, assigneeId: Number(value), assignee: emp?.name ?? '' }));
    } else {
      setForm(f => ({ ...f, [name]: name === 'title' ? cap(value) : value }));
    }
    setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError('');
    try {
      if (task) {
        await updateTask(task.id, form);
      } else {
        await addTask(form);
      }
      onClose();
    } catch (err) {
      setApiError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            {task ? 'Vazifani tahrirlash' : 'Yangi vazifa qo\'shish'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-lg">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Vazifa nomi"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition
                ${errors.title ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Vazifa haqida qisqacha..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {canAssign && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mas'ul xodim</label>
                <select name="assigneeId" value={form.assigneeId} onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition
                    ${errors.assigneeId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`}>
                  <option value="">— Tanlang —</option>
                  {employees
                    .filter(e => e.accountRole !== 'admin' && e.role !== 'admin')
                    .map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                {errors.assigneeId && <p className="text-xs text-red-500 mt-1">{errors.assigneeId}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Muhimlik</label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="High">Yuqori</option>
                <option value="Medium">O'rta</option>
                <option value="Low">Past</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Holat</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="Pending">Kutilmoqda</option>
                <option value="In Progress">Jarayonda</option>
                <option value="Done">Bajarildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Muddat</label>
              <input name="due" type="date" value={form.due} onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition
                  ${errors.due ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`} />
              {errors.due && <p className="text-xs text-red-500 mt-1">{errors.due}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saqlanmoqda...' : (task ? 'Saqlash' : 'Qo\'shish')}</Button>
          </div>
          {apiError && <p className="text-xs text-red-500 text-center mt-2">{apiError}</p>}
        </form>
      </div>
    </div>
  );
}
