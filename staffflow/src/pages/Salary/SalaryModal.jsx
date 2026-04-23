import { useState } from 'react';

export default function SalaryModal({ record, onSave, onClose }) {
  const [form, setForm] = useState({
    base:       record.base,
    bonus:      record.bonus,
    deductions: record.deductions,
  });

  const net = Number(form.base) + Number(form.bonus) - Number(form.deductions);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(record.id, {
      base:       Number(form.base),
      bonus:      Number(form.bonus),
      deductions: Number(form.deductions),
    });
  };

  const field = (name, label, color) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${color}`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Maoshni tahrirlash</h2>
            <p className="text-xs text-gray-400 mt-0.5">{record.name} · {record.role}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('base',       'Asosiy maosh ($)', 'text-gray-700')}
          {field('bonus',      'Bonus ($)',         'text-emerald-700')}
          {field('deductions', 'Chegirma ($)',      'text-red-600')}

          {/* Net preview */}
          <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Sof maosh</span>
            <span className="text-lg font-bold text-indigo-700">
              ${Number(net).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
