// @refresh reset
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { notificationBus } from '../utils/notificationBus';
import { NOTIF_TYPE } from './NotificationContext';

const AppContext = createContext(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayDate = () => new Date().toISOString().split('T')[0];

// Normalize backend user/employee object to frontend shape
const normalizeEmployee = (u) => ({
  id:           u.id || u._id,
  name:         u.name || u.full_name || '',
  email:        u.email,
  role:         u.position || u.role || 'Xodim',
  department:   u.department || u.department_name || '',
  departmentId: u.departmentId || u.department_id || null,
  salary:       Number(u.salary) || 0,
  status:       u.status || 'Active',
  phone:        u.phone || '',
  avatar:       u.avatar || null,
  joinDate:     u.joinDate ? String(u.joinDate).split('T')[0] : '',
  position:     u.position || '',
  accountRole:  u.role || 'employee',
});

const normalizeTask = (t) => ({
  id:          t.id || t._id,
  title:       t.title,
  description: t.description || '',
  status:      t.status || 'Pending',
  priority:    t.priority || 'Medium',
  due:         t.due_date ? String(t.due_date).split('T')[0]
               : (t.dueDate ? String(t.dueDate).split('T')[0] : (t.due || '')),
  assignee:    t.assignee_name || t.assignedTo?.name || t.assignee || 'Tayinlanmagan',
  assigneeId:  t.assigned_to || t.assignedTo?._id || t.assignedTo || t.assigneeId || null,
  createdAt:   t.created_at ? String(t.created_at).split('T')[0]
               : (t.createdAt ? String(t.createdAt).split('T')[0] : ''),
});

const normalizeAttendance = (a) => {
  const rawStatus = a.status || 'Absent';
  const isPresent = ['keldi', 'kech_keldi', 'On Time', 'Late', 'Present'].includes(rawStatus);
  const isLate    = ['kech_keldi', 'Late'].includes(rawStatus);
  return {
    id:         a.id || a._id,
    employeeId: a.user_id || a.userId?._id || a.userId || a.employeeId,
    name:       a.full_name || a.userId?.name || a.name || '',
    date:       a.date,
    checkIn:    a.check_in || a.checkIn || null,
    checkOut:   a.check_out || a.checkOut || null,
    status:     isPresent ? 'Present' : 'Absent',
    late:       isLate,
    workHours:  Number(a.work_hours || a.totalHours || a.workHours) || 0,
  };
};

const normalizeSalary = (s) => ({
  id:         s.id || s._id,
  employeeId: s.user_id || s.userId?._id || s.userId || s.employeeId,
  name:       s.full_name || s.userId?.name || s.name || '',
  role:       s.position || s.userId?.position || s.role || '',
  base:       Number(s.base_salary || s.base) || 0,
  bonus:      Number(s.bonus) || 0,
  deductions: Number(s.deduction || s.deductions) || 0,
  net:        Number(s.net_salary || s.net) || 0,
  month:      s.month || '',
  status:     s.status || 'Pending',
});

// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const { auth } = useAuth();

  const [employees,    setEmployees]    = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [attendance,   setAttendance]   = useState([]);
  const [salaries,     setSalaries]     = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    setError(null);
    try {
      const [empRes, taskRes, attRes, salRes] = await Promise.allSettled([
        api.users.list(),
        api.tasks.list(),
        api.attendance.list(),
        api.salary.list(),
      ]);

      if (empRes.status === 'fulfilled')
        setEmployees(
          (empRes.value.users || [])
            .filter(u => u.role !== 'admin')
            .map(normalizeEmployee)
        );

      if (taskRes.status === 'fulfilled')
        setTasks((taskRes.value.tasks || []).map(normalizeTask));

      if (attRes.status === 'fulfilled')
        setAttendance((attRes.value.attendance || []).map(normalizeAttendance));

      if (salRes.status === 'fulfilled')
        setSalaries((salRes.value.salaries || []).map(normalizeSalary));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Sahifa focus bo'lganda ham yangilash
  useEffect(() => {
    const onFocus = () => { if (auth?.token) fetchAll(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [auth?.token, fetchAll]);

  // ── Activity Log (local only) ──────────────────────────────────────────────
  const addLog = (user, action, target, icon = '🔄') => {
    const entry = {
      id:   Date.now(),
      user, action, target, icon,
      time: new Date().toLocaleString('uz-UZ'),
    };
    setActivityLogs(prev => [entry, ...prev].slice(0, 50));
  };

  // ── Employee CRUD ──────────────────────────────────────────────────────────
  const addEmployee = async (data) => {
    try {
      const res = await api.users.create({
        name:           data.name,
        email:          data.email,
        password:       data.password || 'staffflow123',
        role:           data.accountRole || 'employee',
        position:       data.role || data.position || '',
        departmentId:   data.departmentId || null,
        salary:         Number(data.salary) || 0,
        phone:          data.phone || '',
        status:         'Active',
        approvalStatus: 'approved',
      });
      const emp = normalizeEmployee(res.user);
      setEmployees(prev => [...prev, emp]);
      addLog('Admin', "Yangi xodim qo'shildi", data.name, '👤');
      notificationBus.emit({
        id:          Date.now() + 1,
        userId:      'admin',
        type:        NOTIF_TYPE.SUCCESS,
        title:       "Yangi xodim qo'shildi",
        message:     `${data.name} tizimga qo'shildi.`,
        read:        false,
        createdAt:   new Date().toISOString(),
        relatedType: 'employee',
      });
      return emp;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateEmployee = async (id, data) => {
    try {
      const payload = {};
      if (data.name !== undefined)         payload.name         = data.name;
      if (data.email !== undefined)        payload.email        = data.email;
      if (data.phone !== undefined)        payload.phone        = data.phone;
      if (data.salary !== undefined)       payload.salary       = Number(data.salary);
      if (data.status !== undefined)       payload.status       = data.status;
      if (data.position !== undefined)     payload.position     = data.position;
      if (data.role !== undefined)         payload.position     = data.role;
      if (data.accountRole !== undefined)  payload.accountRole  = data.accountRole;
      if (data.departmentId !== undefined) payload.departmentId = data.departmentId;

      const res = await api.users.update(id, payload);
      const emp = normalizeEmployee(res.user);
      setEmployees(prev => prev.map(e => e.id === id ? emp : e));
      return emp;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.users.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
      setAttendance(prev => prev.filter(a => a.employeeId !== id));
      setSalaries(prev => prev.filter(s => s.employeeId !== id));
      setTasks(prev => prev.map(t =>
        t.assigneeId === id ? { ...t, assigneeId: null, assignee: 'Tayinlanmagan' } : t
      ));
      addLog('Admin', "Xodim o'chirildi", `ID: ${id}`, '🗑️');
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // ── Task CRUD ──────────────────────────────────────────────────────────────
  const addTask = async (data) => {
    try {
      const res = await api.tasks.create({
        title:       data.title,
        description: data.description || '',
        status:      data.status || 'Pending',
        priority:    data.priority || 'Medium',
        dueDate:     data.due || data.dueDate || null,
        assignedTo:  data.assigneeId || null,
      });
      const task = normalizeTask(res.task);
      setTasks(prev => [...prev, task]);
      addLog('Admin', "Yangi vazifa qo'shildi", data.title, '✅');
      if (data.assigneeId) {
        notificationBus.emit({
          id:          Date.now() + 2,
          userId:      data.assigneeId,
          type:        NOTIF_TYPE.INFO,
          title:       'Yangi vazifa tayinlandi',
          message:     `"${data.title}" vazifasi sizga tayinlandi.`,
          read:        false,
          createdAt:   new Date().toISOString(),
          relatedType: 'task',
          relatedId:   task.id,
        });
      }
      return task;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateTask = async (id, data) => {
    try {
      const payload = {};
      if (data.title !== undefined)       payload.title      = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.status !== undefined)      payload.status     = data.status;
      if (data.priority !== undefined)    payload.priority   = data.priority;
      if (data.due !== undefined)         payload.dueDate    = data.due;
      if (data.assigneeId !== undefined)  payload.assignedTo = data.assigneeId;

      const res = await api.tasks.update(id, payload);
      const task = normalizeTask(res.task);
      setTasks(prev => prev.map(t => t.id === id ? task : t));

      if (data.status === 'Done') {
        const original = tasks.find(t => t.id === id);
        if (original) {
          notificationBus.emit({
            id:          Date.now() + 3,
            userId:      'admin',
            type:        NOTIF_TYPE.SUCCESS,
            title:       'Vazifa bajarildi',
            message:     `"${original.title}" vazifasi yakunlandi.`,
            read:        false,
            createdAt:   new Date().toISOString(),
            relatedType: 'task',
            relatedId:   id,
          });
        }
      }
      return task;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.tasks.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // ── Attendance ─────────────────────────────────────────────────────────────
  const checkIn = async (employeeId) => {
    try {
      const res = await api.attendance.checkIn();
      const rec = normalizeAttendance(res.attendance);
      setAttendance(prev => {
        const exists = prev.find(a => a.employeeId === employeeId && a.date === todayDate());
        if (exists) return prev.map(a =>
          a.employeeId === employeeId && a.date === todayDate() ? rec : a
        );
        return [...prev, rec];
      });
    } catch { /* ignore */ }
  };

  const checkOut = async (employeeId) => {
    try {
      const res = await api.attendance.checkOut();
      const rec = normalizeAttendance(res.attendance);
      setAttendance(prev => prev.map(a =>
        a.employeeId === employeeId && a.date === todayDate() ? rec : a
      ));
    } catch { /* ignore */ }
  };

  const toggleAttendance = async (id) => {
    const rec = attendance.find(a => a.id === id);
    if (!rec) return;
    const newStatus = rec.status === 'Present' ? 'Absent' : 'Present';
    try {
      await api.attendance.update(id, { status: newStatus === 'Present' ? 'On Time' : 'Absent' });
      setAttendance(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch { /* ignore */ }
  };

  // ── Salary ─────────────────────────────────────────────────────────────────
  const updateSalary = async (id, data) => {
    try {
      const res = await api.salary.update(id, data);
      const sal = normalizeSalary(res.salary);
      setSalaries(prev => prev.map(s => s.id === id ? sal : s));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return (
    <AppContext.Provider value={{
      employees,    addEmployee,    updateEmployee, deleteEmployee,
      tasks,        addTask,        updateTask,     deleteTask,
      attendance,   checkIn,        checkOut,       toggleAttendance,
      salaries,     updateSalary,
      activityLogs, addLog,
      loading,      error,          refetch: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
