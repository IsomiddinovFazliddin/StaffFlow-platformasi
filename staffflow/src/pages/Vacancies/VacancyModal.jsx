import { useState, useEffect } from 'react';

const DEPARTMENTS = ['Engineering', 'Design', 'HR', 'Marketing', 'Finance', 'Product'];
const STATUSES    = ['Ochiq', 'Yopilgan', 'Arxiv'];

const empty = { title: '', department: 'Engineering', status: 'Ochiq', salaryMin: '', salaryMax: '', experience: '' };

export default function VacancyModal({ vacancy, onSave, onClose }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(vacancy ? { ...vacancy } : empty);
  }, [vacancy]);

  const cap = (v) => v.replace(/^\w/, c => c.toUpperCase());
  const CAPITALIZE_FIELDS = ['title', 'experience'];
  const set = (k, v) => setForm(f => ({ ...f, [k]: CAPITALIZE_FIELDS.includes(k) ? cap(v) : v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: vacancy?.id ?? Date.now(),
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      candidates: vacancy?.candidates ?? 0,
      createdAt: vacancy?.createdAt ?? new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {vacancy ? 'Vakansiyani tahrirlash' : 'Yangi vakansiya'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vakansiya nomi *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Masalan: Senior React Developer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bo'lim</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.department}
                onChange={e => set('department', e.target.value)}
              >
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Holat</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min maosh (UZS)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.salaryMin}
                onChange={e => set('salaryMin', e.target.value)}
                placeholder="5000000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max maosh (UZS)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.salaryMax}
                onChange={e => set('salaryMax', e.target.value)}
                placeholder="10000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tajriba talabi</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={form.experience}
              onChange={e => set('experience', e.target.value)}
              placeholder="Masalan: 3+ yil"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700">
              {vacancy ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
