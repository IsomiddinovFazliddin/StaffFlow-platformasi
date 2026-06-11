import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function EmployeeDashboard() {
  const { auth } = useAuth();
  const { tasks, attendance, salaries } = useApp();

  // Backend: auth.id === user's DB id
  const myId = auth?.id || auth?.employeeId;

  const myTasks      = tasks.filter(t => t.assigneeId === myId || String(t.assigneeId) === String(myId));
  const today        = new Date().toISOString().split('T')[0];
  const myAttendance = attendance.find(a =>
    (a.employeeId === myId || String(a.employeeId) === String(myId)) && a.date === today
  );
  const mySalary = salaries.find(s =>
    s.employeeId === myId || String(s.employeeId) === String(myId)
  );

  const doneTasks    = myTasks.filter(t => t.status === 'Done').length;
  const pendingTasks = myTasks.filter(t => t.status !== 'Done').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Xush kelibsiz, {auth?.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Bugungi holatingiz</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jami vazifalar',  value: myTasks.length,  icon: '📋', color: 'bg-blue-100' },
          { label: 'Faol vazifalar',  value: pendingTasks,    icon: '⏳', color: 'bg-yellow-100' },
          { label: 'Bajarildi',       value: doneTasks,       icon: '✅', color: 'bg-emerald-100' },
          { label: 'Sof maosh',       value: mySalary ? `$${mySalary.net.toLocaleString()}` : '—', icon: '💰', color: 'bg-indigo-100' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-xl`}>{icon}</div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Bugungi davomat</h2>
          {myAttendance ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Holat</span>
                <Badge label={myAttendance.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kirish vaqti</span>
                <span className="text-sm font-medium text-gray-800">{myAttendance.checkIn ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chiqish vaqti</span>
                <span className="text-sm font-medium text-gray-800">{myAttendance.checkOut ?? '—'}</span>
              </div>
              {myAttendance.workHours && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ish soati</span>
                  <span className="text-sm font-medium text-emerald-600">{myAttendance.workHours}h</span>
                </div>
              )}
              {myAttendance.late && (
                <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">⚠️ Bugun kech keldingiz</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Ma'lumot topilmadi</p>
          )}
        </Card>

        {/* My tasks */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Mening vazifalarim</h2>
          {myTasks.length === 0 ? (
            <p className="text-sm text-gray-400">Hozircha vazifa yo'q</p>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">Muddat: {task.due}</p>
                  </div>
                  <Badge label={task.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
