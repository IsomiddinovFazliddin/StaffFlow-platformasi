import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';

const ALERTS = [
  {
    id: 1, level: 'kritik',
    msg: "Sobir Rahimov 3 kundan beri kelmayapti — davomat: 60%. Darhol murojaat qiling.",
    icon: AlertTriangle, border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/10',
    iconCls: 'text-red-500',
  },
  {
    id: 2, level: 'diqqat',
    msg: "Marketing bo'limi vazifalar bajarilishi 45% — maqsad 80%. Bu oy 6 ta vazifa muddati o'tgan.",
    icon: Info, border: 'border-l-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    iconCls: 'text-yellow-500',
  },
  {
    id: 3, level: 'yaxshi',
    msg: "IT bo'limi samaradorligi o'tgan oyga nisbatan +15% oshdi. Jasur Aliyev TOP xodim.",
    icon: CheckCircle, border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    iconCls: 'text-emerald-500',
  },
];

export default function AlertPanel() {
  const [dismissed, setDismissed] = useState([]);
  const [collapsed, setCollapsed]  = useState(false);

  const visible = ALERTS.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <button onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
        <span className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Ogohlantirishlar ({visible.length})
        </span>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {!collapsed && (
        <div className="px-5 pb-4 space-y-2">
          {visible.map(a => {
            const Icon = a.icon;
            return (
              <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${a.border} ${a.bg}`}>
                <Icon size={16} className={`${a.iconCls} shrink-0 mt-0.5`} strokeWidth={2} />
                <p className="text-sm text-gray-700 dark:text-slate-300 flex-1">{a.msg}</p>
                <button onClick={() => setDismissed(d => [...d, a.id])}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 shrink-0">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
