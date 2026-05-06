import { useState } from 'react';
import { X, Clock, Save } from 'lucide-react';

const LS_KEY = 'sf_report_schedule';
const loadSchedule = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };

const FREQ = ['haftalik', 'oylik', 'choraklik'];
const DAYS_UZ = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];

export default function ScheduleSettings({ reports, onClose }) {
  const [cfg, setCfg] = useState(() => {
    const saved = loadSchedule();
    const init = {};
    reports.forEach(r => {
      init[r.id] = saved[r.id] || { enabled: false, frequency: 'oylik', day: 1, time: '08:00', email: '' };
    });
    return init;
  });

  const update = (id, patch) => setCfg(c => ({ ...c, [id]: { ...c[id], ...patch } }));

  const handleSave = () => {
    const now = new Date();
    const withDates = {};
    Object.entries(cfg).forEach(([id, c]) => {
      const next = new Date(now);
      if (c.frequency === 'oylik') next.setMonth(next.getMonth() + 1, c.day);
      else if (c.frequency === 'haftalik') { next.setDate(next.getDate() + ((c.day - now.getDay() + 7) % 7 || 7)); }
      withDates[id] = { ...c, nextRun: next.toISOString() };
    });
    localStorage.setItem(LS_KEY, JSON.stringify(withDates));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-gray-800 dark:text-slate-100">Avtomatik hisobot jadvali</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {reports.map(r => {
            const c = cfg[r.id];
            const Icon = r.icon;
            return (
              <div key={r.id} className={`rounded-xl border p-4 space-y-3 ${c.enabled ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center`}>
                      <Icon size={16} className={r.color} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-100">{r.title}</span>
                  </div>
                  <button onClick={() => update(r.id, { enabled: !c.enabled })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${c.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {c.enabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Chastota</label>
                      <select value={c.frequency} onChange={e => update(r.id, { frequency: e.target.value })}
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none">
                        {FREQ.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">
                        {c.frequency === 'haftalik' ? 'Kun' : 'Oy kuni'}
                      </label>
                      {c.frequency === 'haftalik' ? (
                        <select value={c.day} onChange={e => update(r.id, { day: Number(e.target.value) })}
                          className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none">
                          {DAYS_UZ.map((d, i) => <option key={i} value={i}>{d}</option>)}
                        </select>
                      ) : (
                        <input type="number" min={1} max={31} value={c.day}
                          onChange={e => update(r.id, { day: Number(e.target.value) })}
                          className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none" />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Vaqt</label>
                      <input type="time" value={c.time} onChange={e => update(r.id, { time: e.target.value })}
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Email</label>
                      <input type="email" value={c.email} placeholder="email@company.uz"
                        onChange={e => update(r.id, { email: e.target.value })}
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
            Bekor
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium">
            <Save size={15} /> Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
