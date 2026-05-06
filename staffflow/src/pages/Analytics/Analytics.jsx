import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePenalty } from '../../context/PenaltyContext';
import { Trophy, TrendingUp, Users, Star } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS_UZ = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];
const last6Months = () => {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: MONTHS_UZ[d.getMonth()] });
  }
  return result;
};

// Score: attendance 40% + tasks 40% + penalties 20%
const calcScore = (empId, attendance, tasks, penalties, config) => {
  const att = attendance.filter(a => a.employeeId === empId);
  const attScore = att.length ? Math.round((att.filter(a => a.status === 'Present').length / att.length) * 40) : 0;

  const empTasks = tasks.filter(t => t.assigneeId === empId);
  const taskScore = empTasks.length
    ? Math.round((empTasks.filter(t => t.status === 'Done').length / empTasks.length) * 40)
    : 40;

  const pts = penalties.filter(p => p.employeeId === empId).reduce((s, p) => s + p.points, 0);
  const penScore = Math.max(0, 20 + pts * 2); // each -1 ball = -2 score

  return Math.min(100, attScore + taskScore + penScore);
};

// ── Shared chart card ─────────────────────────────────────────────────────────
function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Employee selector ─────────────────────────────────────────────────────────
function EmpSelector({ employees, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
    </select>
  );
}

// ── Attendance line chart data ────────────────────────────────────────────────
function useAttendanceChartData(empId, attendance) {
  return useMemo(() => {
    const empAtt = attendance.filter(a => a.employeeId === Number(empId));
    // Group by date, last 30 records
    return empAtt.slice(-30).map(a => ({
      date: a.date?.slice(5) ?? '',
      keldi:   a.status === 'Present' && !a.late ? 1 : 0,
      kech:    a.late ? 1 : 0,
      kelmadi: a.status === 'Absent' ? 1 : 0,
    }));
  }, [empId, attendance]);
}

// ── Task bar chart data (6 months) ───────────────────────────────────────────
function useTaskChartData(empId, tasks) {
  const months = last6Months();
  return useMemo(() => {
    const empTasks = tasks.filter(t => t.assigneeId === Number(empId));
    return months.map(m => {
      const monthTasks = empTasks.filter(t => t.createdAt?.startsWith(m.key));
      return {
        oy:          m.label,
        bajarildi:   monthTasks.filter(t => t.status === 'Done').length,
        bajarilmadi: monthTasks.filter(t => t.status !== 'Done').length,
      };
    });
  }, [empId, tasks]);
}

// ── Penalty area chart data ───────────────────────────────────────────────────
function usePenaltyChartData(empId, penalties) {
  const months = last6Months();
  return useMemo(() => {
    let cumulative = 0;
    return months.map(m => {
      const pts = penalties
        .filter(p => p.employeeId === Number(empId) && p.month === m.key)
        .reduce((s, p) => s + p.points, 0);
      cumulative += pts;
      return { oy: m.label, oylik: pts, jami: cumulative };
    });
  }, [empId, penalties]);
}

// ── Rating table ──────────────────────────────────────────────────────────────
function RatingTable({ employees, attendance, tasks, penalties, config, filterDept }) {
  const filtered = filterDept
    ? employees.filter(e => e.department === filterDept)
    : employees;

  const ranked = filtered
    .map(e => ({ ...e, score: calcScore(e.id, attendance, tasks, penalties, config) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  return (
    <div className="space-y-3">
      {best && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Trophy size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{best.name}</p>
            <p className="text-xs text-amber-600">Oy eng yaxshi xodimi · {best.score} ball</p>
          </div>
          <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">⭐ TOP</span>
        </div>
      )}
      <div className="space-y-2">
        {ranked.map((e, i) => (
          <div key={e.id} className="flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-medium text-gray-800 truncate">{e.name}</p>
                <span className="text-xs font-semibold text-indigo-600 ml-2">{e.score}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${e.score}%`, background: e.score >= 80 ? '#10b981' : e.score >= 60 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { employees, attendance, tasks } = useApp();
  const { auth } = useAuth();
  const { penalties, config } = usePenalty();

  const role = auth?.role;
  const isAdmin   = role === 'admin';
  const isHR      = role === 'admin';
  const isLead    = role === 'team_lead';
  const isEmp     = role === 'employee';

  // Visible employees based on role
  const visibleEmps = useMemo(() => {
    if (isAdmin || isHR) return employees;
    if (isLead) {
      // Team lead sees Engineering dept (or their dept)
      const leadEmp = employees.find(e => e.id === auth?.employeeId);
      return employees.filter(e => e.department === (leadEmp?.department ?? 'Engineering'));
    }
    return employees.filter(e => e.id === auth?.employeeId);
  }, [employees, role, auth?.employeeId]);

  const [selectedEmpId, setSelectedEmpId] = useState(() =>
    String(visibleEmps[0]?.id ?? '')
  );
  const [filterDept, setFilterDept] = useState('');

  const depts = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const attData     = useAttendanceChartData(selectedEmpId, attendance);
  const taskData    = useTaskChartData(selectedEmpId, tasks);
  const penaltyData = usePenaltyChartData(selectedEmpId, penalties);

  const selectedEmp = visibleEmps.find(e => e.id === Number(selectedEmpId));
  const myScore = selectedEmp
    ? calcScore(selectedEmp.id, attendance, tasks, penalties, config)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Samaradorlik analitikasi</h1>
          <p className="text-gray-500 text-sm mt-1">Xodimlar faoliyati va statistikasi</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(isAdmin || isHR) && (
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Barcha bo'limlar</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          {visibleEmps.length > 1 && (
            <EmpSelector employees={visibleEmps} value={selectedEmpId}
              onChange={v => setSelectedEmpId(v)} />
          )}
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Samaradorlik', value: `${myScore}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Kelgan kunlar', value: attendance.filter(a => a.employeeId === Number(selectedEmpId) && a.status === 'Present').length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Bajarilgan vazifalar', value: tasks.filter(t => t.assigneeId === Number(selectedEmpId) && t.status === 'Done').length, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Minus ballar', value: penalties.filter(p => p.employeeId === Number(selectedEmpId)).reduce((s, p) => s + p.points, 0), icon: Trophy, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={color} strokeWidth={2} />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Oylik davomat (so'nggi 30 kun)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="keldi"   stroke="#10b981" strokeWidth={2} dot={false} name="Keldi" />
              <Line type="monotone" dataKey="kech"    stroke="#f59e0b" strokeWidth={2} dot={false} name="Kech" />
              <Line type="monotone" dataKey="kelmadi" stroke="#ef4444" strokeWidth={2} dot={false} name="Kelmadi" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vazifa bajarish (6 oy)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="oy" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="bajarildi"   fill="#6366f1" radius={[4,4,0,0]} name="Bajarildi" />
              <Bar dataKey="bajarilmadi" fill="#fca5a5" radius={[4,4,0,0]} name="Bajarilmadi" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Ball dinamikasi (6 oy)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={penaltyData}>
              <defs>
                <linearGradient id="penGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="oy" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="oylik" stroke="#ef4444" fill="url(#penGrad)" strokeWidth={2} name="Oylik ball" />
              <Area type="monotone" dataKey="jami"  stroke="#f97316" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Jami ball" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating */}
        <ChartCard title={`Reyting — ${filterDept || 'Barcha bo\'limlar'}`}>
          <RatingTable
            employees={filterDept ? employees.filter(e => e.department === filterDept) : visibleEmps}
            attendance={attendance} tasks={tasks} penalties={penalties} config={config}
            filterDept={filterDept}
          />
        </ChartCard>
      </div>
    </div>
  );
}
