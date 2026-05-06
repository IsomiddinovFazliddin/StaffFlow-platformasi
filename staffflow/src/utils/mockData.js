// ─── Departments ────────────────────────────────────────────────────────────
export const departments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'HR' },
  { id: 4, name: 'Product' },
  { id: 5, name: 'Finance' },
  { id: 6, name: 'Marketing' },
];

// ─── Roles & Permissions ─────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:     'admin',
  TEAM_LEAD: 'team_lead',
  EMPLOYEE:  'employee',
};

export const PERMISSIONS = {
  VIEW_EMPLOYEES:      'view_employees',
  ADD_EMPLOYEE:        'add_employee',
  EDIT_EMPLOYEE:       'edit_employee',
  DELETE_EMPLOYEE:     'delete_employee',
  VIEW_DEPARTMENTS:    'view_departments',
  MANAGE_DEPARTMENTS:  'manage_departments',
  VIEW_ALL_TASKS:      'view_all_tasks',
  VIEW_OWN_TASKS:      'view_own_tasks',
  CREATE_TASK:         'create_task',
  ASSIGN_TASK:         'assign_task',
  UPDATE_TASK:         'update_task',
  DELETE_TASK:         'delete_task',
  VIEW_ALL_ATTENDANCE: 'view_all_attendance',
  VIEW_OWN_ATTENDANCE: 'view_own_attendance',
  MANAGE_ATTENDANCE:   'manage_attendance',
  CHECKIN:             'checkin',
  VIEW_ALL_SALARY:     'view_all_salary',
  VIEW_OWN_SALARY:     'view_own_salary',
  MANAGE_SALARY:       'manage_salary',
  VIEW_DASHBOARD:      'view_dashboard',
  MANAGE_SETTINGS:     'manage_settings',
  VIEW_REPORTS:        'view_reports',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.TEAM_LEAD]: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.VIEW_ALL_TASKS, PERMISSIONS.VIEW_OWN_TASKS, PERMISSIONS.CREATE_TASK, PERMISSIONS.ASSIGN_TASK, PERMISSIONS.UPDATE_TASK,
    PERMISSIONS.VIEW_ALL_ATTENDANCE, PERMISSIONS.CHECKIN,
    PERMISSIONS.VIEW_OWN_SALARY,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_OWN_TASKS, PERMISSIONS.UPDATE_TASK,
    PERMISSIONS.VIEW_OWN_ATTENDANCE, PERMISSIONS.CHECKIN,
    PERMISSIONS.VIEW_OWN_SALARY,
  ],
};

// ─── Mock Users (for AuthContext) ────────────────────────────────────────────
export const MOCK_USERS = [
  { id: 1, name: 'Admin User',    email: 'admin@staffflow.com', password: 'admin123',  role: ROLES.ADMIN,     employeeId: null },
  { id: 2, name: 'Carol White',   email: 'carol@staffflow.com', password: 'hr123',     role: ROLES.ADMIN,     employeeId: 3 },
  { id: 3, name: 'David Lee',     email: 'david@staffflow.com', password: 'lead123',   role: ROLES.TEAM_LEAD, employeeId: 4 },
  { id: 4, name: 'Alice Johnson', email: 'alice@staffflow.com', password: 'emp123',    role: ROLES.EMPLOYEE,  employeeId: 1 },
  { id: 5, name: 'Ali Valiyev',   email: 'employee@staffflow.com', password: 'employee123', role: ROLES.EMPLOYEE, employeeId: 2 },
];

// ─── Employees ───────────────────────────────────────────────────────────────
export const employees = [
  { id: 1, name: 'Alice Johnson', role: 'Frontend Developer', department: 'Engineering', email: 'alice@staffflow.com', salary: 5800, status: 'Active',   phone: '+998 90 111 22 33', joinDate: '2024-01-15' },
  { id: 2, name: 'Bob Smith',     role: 'UI/UX Designer',     department: 'Design',       email: 'bob@staffflow.com',   salary: 5150, status: 'Active',   phone: '+998 90 222 33 44', joinDate: '2024-02-01' },
  { id: 3, name: 'Carol White',   role: 'HR Manager',         department: 'HR',           email: 'carol@staffflow.com', salary: 5420, status: 'Active',   phone: '+998 90 333 44 55', joinDate: '2023-11-10' },
  { id: 4, name: 'David Lee',     role: 'Backend Developer',  department: 'Engineering',  email: 'david@staffflow.com', salary: 6180, status: 'On Leave', phone: '+998 90 444 55 66', joinDate: '2023-09-05' },
  { id: 5, name: 'Eva Martinez',  role: 'Product Manager',    department: 'Product',      email: 'eva@staffflow.com',   salary: 6450, status: 'Active',   phone: '+998 90 555 66 77', joinDate: '2024-03-20' },
  { id: 6, name: 'Frank Brown',   role: 'Marketing Lead',     department: 'Marketing',    email: 'frank@staffflow.com', salary: 4900, status: 'Active',   phone: '+998 90 666 77 88', joinDate: '2024-04-01' },
  { id: 7, name: 'Grace Kim',     role: 'Finance Analyst',    department: 'Finance',      email: 'grace@staffflow.com', salary: 5300, status: 'Active',   phone: '+998 90 777 88 99', joinDate: '2024-05-15' },
];

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasks = [
  { id: 1, title: 'Design new onboarding flow', description: 'Create wireframes and prototypes for the new user onboarding experience.', assigneeId: 2, assignee: 'Bob Smith',    priority: 'High',   status: 'In Progress', due: '2026-04-01', createdAt: '2026-03-20' },
  { id: 2, title: 'Fix login bug',               description: 'Investigate and fix the authentication bug reported by QA team.',          assigneeId: 1, assignee: 'Alice Johnson', priority: 'High',   status: 'Done',        due: '2026-03-20', createdAt: '2026-03-18' },
  { id: 3, title: 'Write Q1 HR report',          description: 'Compile and write the quarterly HR performance report.',                   assigneeId: 3, assignee: 'Carol White',  priority: 'Medium', status: 'Pending',     due: '2026-04-10', createdAt: '2026-03-22' },
  { id: 4, title: 'API integration for payroll', description: 'Integrate the payroll calculation API with the backend service.',          assigneeId: 4, assignee: 'David Lee',    priority: 'High',   status: 'Pending',     due: '2026-04-15', createdAt: '2026-03-21' },
  { id: 5, title: 'User research interviews',    description: 'Conduct 10 user interviews for the new product feature research.',         assigneeId: 5, assignee: 'Eva Martinez', priority: 'Low',    status: 'In Progress', due: '2026-04-05', createdAt: '2026-03-19' },
  { id: 6, title: 'Marketing campaign Q2',       description: 'Plan and execute the Q2 digital marketing campaign.',                      assigneeId: 6, assignee: 'Frank Brown',  priority: 'Medium', status: 'Pending',     due: '2026-04-20', createdAt: '2026-03-23' },
  { id: 7, title: 'Financial audit prep',        description: 'Prepare documents and reports for the upcoming financial audit.',          assigneeId: 7, assignee: 'Grace Kim',    priority: 'High',   status: 'Pending',     due: '2026-04-08', createdAt: '2026-03-24' },
];

// ─── Attendance ───────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
export const attendance = [
  { id: 1, employeeId: 1, name: 'Alice Johnson', date: today, checkIn: '09:02', checkOut: '18:05', status: 'Present', late: false,  workHours: 9.05 },
  { id: 2, employeeId: 2, name: 'Bob Smith',     date: today, checkIn: '09:45', checkOut: '18:30', status: 'Present', late: true,   workHours: 8.75 },
  { id: 3, employeeId: 3, name: 'Carol White',   date: today, checkIn: null,    checkOut: null,    status: 'Absent',  late: false,  workHours: 0 },
  { id: 4, employeeId: 4, name: 'David Lee',     date: today, checkIn: null,    checkOut: null,    status: 'Absent',  late: false,  workHours: 0 },
  { id: 5, employeeId: 5, name: 'Eva Martinez',  date: today, checkIn: '08:55', checkOut: '17:58', status: 'Present', late: false,  workHours: 9.05 },
  { id: 6, employeeId: 6, name: 'Frank Brown',   date: today, checkIn: '10:15', checkOut: null,    status: 'Present', late: true,   workHours: null },
  { id: 7, employeeId: 7, name: 'Grace Kim',     date: today, checkIn: '08:50', checkOut: '18:00', status: 'Present', late: false,  workHours: 9.17 },
];

// ─── Salary ───────────────────────────────────────────────────────────────────
export const salaries = [
  { id: 1, employeeId: 1, name: 'Alice Johnson', role: 'Frontend Developer', base: 5500, bonus: 500, deductions: 200, net: 5800,  month: 'Mart 2026',   status: 'Paid' },
  { id: 2, employeeId: 2, name: 'Bob Smith',     role: 'UI/UX Designer',     base: 5000, bonus: 300, deductions: 150, net: 5150,  month: 'Mart 2026',   status: 'Paid' },
  { id: 3, employeeId: 3, name: 'Carol White',   role: 'HR Manager',         base: 5200, bonus: 400, deductions: 180, net: 5420,  month: 'Mart 2026',   status: 'Paid' },
  { id: 4, employeeId: 4, name: 'David Lee',     role: 'Backend Developer',  base: 5800, bonus: 600, deductions: 220, net: 6180,  month: 'Mart 2026',   status: 'Pending' },
  { id: 5, employeeId: 5, name: 'Eva Martinez',  role: 'Product Manager',    base: 6000, bonus: 700, deductions: 250, net: 6450,  month: 'Mart 2026',   status: 'Paid' },
  { id: 6, employeeId: 6, name: 'Frank Brown',   role: 'Marketing Lead',     base: 4700, bonus: 300, deductions: 100, net: 4900,  month: 'Mart 2026',   status: 'Paid' },
  { id: 7, employeeId: 7, name: 'Grace Kim',     role: 'Finance Analyst',    base: 5100, bonus: 350, deductions: 150, net: 5300,  month: 'Mart 2026',   status: 'Paid' },
];

// ─── Salary History ───────────────────────────────────────────────────────────
export const salaryHistory = [
  { month: 'Yan 2026', total: 36800 },
  { month: 'Fev 2026', total: 37200 },
  { month: 'Mart 2026', total: 38200 },
];

// ─── Activity Logs ────────────────────────────────────────────────────────────
export const activityLogs = [
  { id: 1, user: 'Admin User',    action: 'Yangi xodim qo\'shildi',    target: 'Grace Kim',          time: '2026-03-24 09:15', icon: '👤' },
  { id: 2, user: 'Carol White',   action: 'Davomat yangilandi',         target: 'Bob Smith',          time: '2026-03-24 09:30', icon: '📅' },
  { id: 3, user: 'David Lee',     action: 'Vazifa tayinlandi',          target: 'API integration',    time: '2026-03-24 10:00', icon: '✅' },
  { id: 4, user: 'Admin User',    action: 'Maosh hisoblandi',           target: 'Mart 2026',          time: '2026-03-24 11:00', icon: '💰' },
  { id: 5, user: 'Alice Johnson', action: 'Vazifa holati yangilandi',   target: 'Fix login bug',      time: '2026-03-24 11:30', icon: '🔄' },
];
