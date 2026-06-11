import { useApp } from '../../context/AppContext';
import { useDepartments } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { salaryHistory } from '../../utils/mockData';
import { interviews as hrInterviews } from '../../utils/hrData';

const PIE_COLORS = ['#f59e0b', '#6366f1', '#10b981'];

const fmtUZS = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

// UZS ga o'tkazish (1 USD = 12 800 UZS taxminan)
const USD_TO_UZS = 12_800;
const salaryHistoryUZS = salaryHistory.map(s => ({
  ...s,
  total: s.total * USD_TO_UZS,
}));

// Mock: tug'ilgan kunlar (HR widget) — employees dan dinamik olinadi


const ROLE_LABELS = {
  admin:      '🛡️ Admin',
  hr_manager: '👩‍💼 HR Manager',
  team_lead:  '🎯 Team Lead',
  employee:   '👤 Xodim',
};

// ── Stat card component (uniform height) ─────────────────────────────────────
function StatCard({ title, value, icon, bg, iconBg }) {
  return (
    <div className={`${bg} dark:!bg-slate-800 dark:!border-slate-700 rounded-2xl p-5 flex items-center gap-4 h-24`}>
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-slate-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Admin / Super Admin dashboard ─────────────────────────────────────────────
function AdminDashboard({ employees, tasks, attendance, activityLogs, departments }) {
  const presentCount   = attendance.filter(a => a.status === 'Present').length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const pendingTasks   = tasks.filter(t => t.status !== 'Done').length;
  const doneTasks      = tasks.filter(t => t.status === 'Done').length;

  const taskPie = [
    { name: 'Kutilmoqda', value: tasks.filter(t => t.status === 'Pending').length },
    { name: 'Jarayonda',  value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'Bajarildi',  value: tasks.filter(t => t.status === 'Done').length },
  ].filter(d => d.value > 0);

  const deptBar = departments.map(d => ({
    name: d.name,
    count: employees.filter(e => e.department === d.name).length,
  })).filter(d => d.count > 0);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Jami xodimlar"  value={employees.length}     icon="👥" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-blue-100" />
        <StatCard title="Faol vazifalar" value={pendingTasks}         icon="⏳" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-yellow-100" />
        <StatCard title="Bajarildi"      value={doneTasks}            icon="✅" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-green-100" />
        <StatCard title="Davomat foizi"  value={`${attendanceRate}%`} icon="📅" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-purple-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Oylik ish haqi (UZS)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={salaryHistoryUZS} barSize={36}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtUZS} />
              <Tooltip formatter={v => [`${fmtUZS(v)} UZS`, 'Jami']} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Vazifalar holati</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={taskPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {taskPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Bo'limlar bo'yicha xodimlar</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={deptBar} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">So'nggi xodimlar</h2>
          <div className="space-y-3">
            {employees.slice(0, 5).map(emp => (
              <div key={emp.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {emp.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-tight">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.department}</p>
                  </div>
                </div>
                <Badge label={emp.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">So'nggi faoliyat</h2>
          <div className="space-y-3">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-base mt-0.5">{log.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {log.action}: <span className="text-indigo-600">{log.target}</span>
                  </p>
                  <p className="text-xs text-gray-400">{log.user} · {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ── HR Manager dashboard ──────────────────────────────────────────────────────
function HRDashboard({ employees, attendance }) {
  const presentCount   = attendance.filter(a => a.status === 'Present').length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const activeCount    = employees.filter(e => e.status === 'Active').length;
  const onLeaveCount   = employees.filter(e => e.status === 'On Leave').length;

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Jami xodimlar"  value={employees.length} icon="👥" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-blue-100" />
        <StatCard title="Faol xodimlar"  value={activeCount}      icon="✅" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-green-100" />
        <StatCard title="Ta'tilda"        value={onLeaveCount}     icon="🏖️" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-orange-100" />
        <StatCard title="Davomat foizi"  value={`${attendanceRate}%`} icon="📅" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-purple-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Birthdays — employees dan dinamik */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">🎂 Xodimlar ro'yxati</h2>
          <div className="space-y-3">
            {employees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Xodimlar topilmadi</p>
            ) : employees.slice(0, 5).map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold text-sm">
                    {emp.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.department}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                  ${emp.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
                  {emp.status === 'Active' ? 'Faol' : "Ta'tilda"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Interviews */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">📋 Yaqinlashayotgan intervyular</h2>
          <div className="space-y-3">
            {hrInterviews.filter(iv => iv.status === 'Kutilmoqda').slice(0, 4).map((iv) => {
              const todayStr    = new Date().toISOString().split('T')[0];
              const tomorrowStr = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
              const isToday     = iv.date === todayStr;
              const isTomorrow  = iv.date === tomorrowStr;

              // "Tez orada" if today and within 30 min
              let timeBadge = null;
              if (isToday) {
                const [h, m] = iv.time.split(':').map(Number);
                const now = new Date();
                const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
                if (diff <= 0)       timeBadge = <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Hozir</span>;
                else if (diff <= 30) timeBadge = <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Tez orada</span>;
                else                 timeBadge = <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Bugun</span>;
              } else if (isTomorrow) {
                timeBadge = <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ertaga</span>;
              }

              return (
                <div key={iv.id} className={`flex items-center justify-between p-3 rounded-xl ${isToday ? 'bg-violet-50' : 'bg-blue-50'}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{iv.candidate}</p>
                    <p className="text-xs text-gray-400">{iv.vacancy}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-semibold text-violet-700">{iv.time}</p>
                    {timeBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Attendance summary */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Bugungi davomat</h2>
        <div className="space-y-2">
          {attendance.map(a => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {a.name[0]}
                </div>
                <span className="text-sm text-gray-700">{a.name}</span>
                {a.late && <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">Kech</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{a.checkIn ?? '—'} → {a.checkOut ?? '—'}</span>
                <Badge label={a.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ── Team Lead dashboard ───────────────────────────────────────────────────────
function TeamLeadDashboard({ tasks, employees, auth }) {
  // Team lead sees only employees (not other leads/managers) in their department
  const leadDept = auth?.department || auth?.departmentId;

  const myTeam = employees.filter(e => {
    const isEmployee = e.accountRole === 'employee' || e.role === 'employee';
    const inDept = leadDept
      ? (e.departmentId === auth?.departmentId || String(e.departmentId) === String(auth?.departmentId) || e.department === auth?.department)
      : true;
    return isEmployee && inDept;
  });

  const allTasks   = tasks;
  const pending    = allTasks.filter(t => t.status === 'Pending').length;
  const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
  const done       = allTasks.filter(t => t.status === 'Done').length;

  const taskPie = [
    { name: 'Kutilmoqda', value: pending },
    { name: 'Jarayonda',  value: inProgress },
    { name: 'Bajarildi',  value: done },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Mening jamoam"  value={myTeam.length}    icon="👥" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-cyan-100" />
        <StatCard title="Kutilmoqda"     value={pending}          icon="⏳" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-yellow-100" />
        <StatCard title="Jarayonda"      value={inProgress}       icon="🔄" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-blue-100" />
        <StatCard title="Bajarildi"      value={done}             icon="✅" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Vazifalar holati</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={taskPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {taskPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Mening jamoam</h2>
          <div className="space-y-3">
            {myTeam.map(emp => (
              <div key={emp.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-xs">
                    {emp.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.role}</p>
                  </div>
                </div>
                <Badge label={emp.status} />
              </div>
            ))}
            {myTeam.length === 0 && <p className="text-sm text-gray-400">Jamoa topilmadi</p>}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Barcha vazifalar</h2>
        <div className="space-y-2">
          {allTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-400">{task.assignee} · {task.due}</p>
              </div>
              <Badge label={task.status} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ── Employee dashboard ────────────────────────────────────────────────────────
function EmployeeDashboardWidget({ tasks, attendance, salaries, auth }) {
  const myTasks      = tasks.filter(t => t.assigneeId === auth?.employeeId);
  const myAttendance = attendance.find(a => a.employeeId === auth?.employeeId);
  const mySalary     = salaries.find(s => s.employeeId === auth?.employeeId);

  const doneTasks    = myTasks.filter(t => t.status === 'Done').length;
  const pendingTasks = myTasks.filter(t => t.status !== 'Done').length;

  // Work hours progress (8h = 100%)
  const workHours    = myAttendance?.workHours ?? 0;
  const workProgress = Math.min(Math.round((workHours / 8) * 100), 100);

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Jami vazifalar"  value={myTasks.length} icon="📋" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-blue-100" />
        <StatCard title="Faol vazifalar"  value={pendingTasks}   icon="⏳" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-yellow-100" />
        <StatCard title="Bajarildi"       value={doneTasks}      icon="✅" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-green-100" />
        <StatCard title="Sof maosh"       value={mySalary ? `${(mySalary.net * USD_TO_UZS / 1_000_000).toFixed(1)}M` : '—'} icon="💰" bg="bg-white border border-gray-100 shadow-sm" iconBg="bg-emerald-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Work hours progress */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">⏱️ Bugungi ish soati</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ishlangan vaqt</span>
              <span className="font-semibold text-gray-800">{workHours}h / 8h</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${workProgress}%`,
                  background: workProgress >= 100
                    ? 'linear-gradient(90deg,#10b981,#059669)'
                    : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{myAttendance?.checkIn ? `Kirdi: ${myAttendance.checkIn}` : 'Hali kirmagan'}</span>
              <span>{workProgress}%</span>
            </div>
            {myAttendance?.late && (
              <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">⚠️ Bugun kech keldingiz</p>
            )}
          </div>
        </Card>

        {/* Bonus card */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">🎁 Joriy oy bonuslari</h2>
          {mySalary ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm text-gray-600">Asosiy maosh</span>
                <span className="font-semibold text-gray-800">{fmtUZS(mySalary.base * USD_TO_UZS)} UZS</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-gray-600">Bonus</span>
                <span className="font-semibold text-emerald-600">+{fmtUZS(mySalary.bonus * USD_TO_UZS)} UZS</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-gray-600">Chegirmalar</span>
                <span className="font-semibold text-red-500">-{fmtUZS(mySalary.deductions * USD_TO_UZS)} UZS</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-sm font-semibold text-gray-700">Sof maosh</span>
                <span className="text-lg font-bold text-indigo-700">{fmtUZS(mySalary.net * USD_TO_UZS)} UZS</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Ma'lumot topilmadi</p>
          )}
        </Card>
      </div>

      {/* My tasks */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Mening vazifalarim</h2>
        {myTasks.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Hozircha vazifa yo'q</p>
        ) : (
          <div className="space-y-2">
            {myTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-400">Muddat: {task.due}</p>
                </div>
                <Badge label={task.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { employees, tasks, attendance, activityLogs, salaries } = useApp();
  const { departments } = useDepartments();
  const { auth } = useAuth();

  const role = auth?.role;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Boshqaruv paneli</h1>
        <p className="text-gray-500 text-sm mt-1">
          Xush kelibsiz,{' '}
          <span className="font-medium text-indigo-600">{auth?.name}</span>
          {' · '}
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {ROLE_LABELS[role] ?? role}
          </span>
        </p>
      </div>

      {/* Role-based content */}
      {role === 'admin' && (
        <AdminDashboard
          employees={employees} tasks={tasks} attendance={attendance}
          activityLogs={activityLogs} departments={departments}
        />
      )}

      {role === 'admin' && (
        <HRDashboard employees={employees} attendance={attendance} />
      )}

      {role === 'team_lead' && (
        <TeamLeadDashboard tasks={tasks} employees={employees} auth={auth} />
      )}

      {role === 'employee' && (
        <EmployeeDashboardWidget
          tasks={tasks} attendance={attendance} salaries={salaries} auth={auth}
        />
      )}
    </div>
  );
}
