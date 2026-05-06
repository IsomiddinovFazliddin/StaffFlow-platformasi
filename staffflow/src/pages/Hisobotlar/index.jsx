import { useState, useEffect } from 'react';
import { FileText, Users, CalendarCheck, Banknote, CheckSquare, AlertTriangle, TrendingUp, Clock, Plus, Download, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePenalty } from '../../context/PenaltyContext';
import ReportPreview from './components/ReportPreview';
import ScheduleSettings from './components/ScheduleSettings';

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const fmtDate = () => {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const REPORTS = [
  {
    id: 'xodimlar',
    title: 'Xodimlar hisoboti',
    desc: "Barcha xodimlar ro'yxati, lavozim, bo'lim ma'lumotlari",
    icon: Users,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    id: 'davomat',
    title: 'Davomat hisoboti',
    desc: 'Xodimlar davomati, kechikish va ishtirok statistikasi',
    icon: CalendarCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    id: 'maosh',
    title: 'Maosh hisoboti',
    desc: "Oylik maosh to'lovlari va umumiy xarajatlar",
    icon: Banknote,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    btnColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  {
    id: 'vazifalar',
    title: 'Vazifalar hisoboti',
    desc: 'Vazifalar bajarilish darajasi va xodim samaradorligi',
    icon: CheckSquare,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    id: 'jarima',
    title: 'Jarima hisoboti',
    desc: "Jarima va chegirmalar to'liq ro'yxati",
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    btnColor: 'bg-red-600 hover:bg-red-700',
  },
  {
    id: 'umumiy',
    title: 'Umumiy hisobot',
    desc: "Tashkilotning to'liq yillik faoliyat xulosasi",
    icon: TrendingUp,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    btnColor: 'bg-teal-600 hover:bg-teal-700',
  },
];

const LS_KEY = 'sf_report_downloads';
const loadDownloads = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || 0; } catch { return 0; } };

export default function Hisobotlar() {
  const { employees, attendance, tasks, salaries } = useApp();
  const { penalties } = usePenalty();
  const [preview,   setPreview]   = useState(null); // report id
  const [schedule,  setSchedule]  = useState(false);
  const [downloads, setDownloads] = useState(loadDownloads);

  // Schedule check every minute
  useEffect(() => {
    const check = () => {
      try {
        const sched = JSON.parse(localStorage.getItem('sf_report_schedule')) || {};
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        Object.entries(sched).forEach(([id, cfg]) => {
          if (!cfg.enabled) return;
          const day = cfg.frequency === 'haftalik' ? now.getDay() : now.getDate();
          if (day === cfg.day && hhmm === cfg.time) {
            console.log(`Auto-generating: ${id}`);
          }
        });
      } catch { /* ignore */ }
    };
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, []);

  const scheduleData = (() => {
    try { return JSON.parse(localStorage.getItem('sf_report_schedule')) || {}; } catch { return {}; }
  })();

  const nextScheduled = Object.entries(scheduleData)
    .filter(([, c]) => c.enabled)
    .map(([id, c]) => ({ id, ...c }))
    .slice(0, 3);

  const thisMonthCreated = Object.values(scheduleData).filter(c => c.lastRun?.startsWith(new Date().toISOString().slice(0,7))).length;

  const appData = { employees, attendance, tasks, salaries, penalties };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Hisobotlar</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Barcha hisobotlarni boshqaring</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSchedule(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Clock size={16} /> Jadval sozlamalari
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jami hisobotlar', value: REPORTS.length, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Bu oy yaratilgan', value: thisMonthCreated, icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Rejalashtirilgan', value: nextScheduled.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Yuklab olingan', value: downloads, icon: Download, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-white/5`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} strokeWidth={2} />
              <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Report cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(r => {
          const Icon = r.icon;
          const isScheduled = scheduleData[r.id]?.enabled;
          return (
            <div key={r.id} className={`bg-white dark:bg-slate-800 rounded-2xl border ${r.bg} dark:border-slate-700 shadow-sm p-5 flex flex-col gap-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center`}>
                    <Icon size={20} className={r.color} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{r.title}</h3>
                    {isScheduled && (
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">Avtomatik</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Oxirgi: {fmtDate()}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => setPreview(r.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <Eye size={13} /> Ko'rish
                </button>
                <button onClick={() => setPreview(r.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 ${r.btnColor} text-white rounded-xl text-xs font-medium transition-colors`}>
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {preview && (
        <ReportPreview
          reportId={preview}
          report={REPORTS.find(r => r.id === preview)}
          appData={appData}
          onClose={() => setPreview(null)}
          onDownload={() => {
            const n = loadDownloads() + 1;
            localStorage.setItem(LS_KEY, n);
            setDownloads(n);
          }}
        />
      )}

      {/* Schedule modal */}
      {schedule && <ScheduleSettings reports={REPORTS} onClose={() => setSchedule(false)} />}
    </div>
  );
}
