// ─── Vacancies ────────────────────────────────────────────────────────────────
export const vacancies = [
  { id: 1, title: 'Senior React Developer',   department: 'Engineering', status: 'Ochiq',   salaryMin: 8_000_000,  salaryMax: 12_000_000, experience: '3+ yil',  createdAt: '2026-03-10', candidates: 5 },
  { id: 2, title: 'UI/UX Designer',           department: 'Design',      status: 'Ochiq',   salaryMin: 6_000_000,  salaryMax: 9_000_000,  experience: '2+ yil',  createdAt: '2026-03-12', candidates: 8 },
  { id: 3, title: 'HR Specialist',            department: 'HR',          status: 'Ochiq',   salaryMin: 5_000_000,  salaryMax: 7_000_000,  experience: '1+ yil',  createdAt: '2026-03-15', candidates: 3 },
  { id: 4, title: 'Backend Developer (Node)', department: 'Engineering', status: 'Yopilgan', salaryMin: 9_000_000, salaryMax: 14_000_000, experience: '4+ yil',  createdAt: '2026-02-20', candidates: 12 },
  { id: 5, title: 'Marketing Manager',        department: 'Marketing',   status: 'Ochiq',   salaryMin: 7_000_000,  salaryMax: 10_000_000, experience: '3+ yil',  createdAt: '2026-03-18', candidates: 6 },
  { id: 6, title: 'Finance Analyst',          department: 'Finance',     status: 'Arxiv',   salaryMin: 6_500_000,  salaryMax: 9_500_000,  experience: '2+ yil',  createdAt: '2026-01-15', candidates: 9 },
  { id: 7, title: 'Product Manager',          department: 'Product',     status: 'Ochiq',   salaryMin: 10_000_000, salaryMax: 15_000_000, experience: '5+ yil',  createdAt: '2026-03-20', candidates: 4 },
];

// ─── Interviews ───────────────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

export const interviews = [
  { id: 1, candidate: 'Jasur Toshmatov',  vacancyId: 1, vacancy: 'Senior React Developer',   date: todayStr,  time: '14:00', interviewer: 'Carol White', status: 'Kutilmoqda',   resumeUrl: '#', feedback: '' },
  { id: 2, candidate: 'Malika Yusupova',  vacancyId: 3, vacancy: 'HR Specialist',             date: tomorrow,  time: '10:30', interviewer: 'Carol White', status: 'Kutilmoqda',   resumeUrl: '#', feedback: '' },
  { id: 3, candidate: 'Bobur Karimov',    vacancyId: 2, vacancy: 'UI/UX Designer',            date: tomorrow,  time: '15:00', interviewer: 'Carol White', status: 'Kutilmoqda',   resumeUrl: '#', feedback: '' },
  { id: 4, candidate: 'Dilnoza Rahimova', vacancyId: 5, vacancy: 'Marketing Manager',         date: '2026-03-26', time: '11:00', interviewer: 'Carol White', status: 'Kutilmoqda', resumeUrl: '#', feedback: '' },
  { id: 5, candidate: 'Sherzod Nazarov',  vacancyId: 4, vacancy: 'Backend Developer (Node)',  date: '2026-03-22', time: '09:30', interviewer: 'Carol White', status: 'Yakunlandi',  resumeUrl: '#', feedback: 'Yaxshi texnik bilim, lekin tajriba yetarli emas.' },
  { id: 6, candidate: 'Kamola Mirzayeva', vacancyId: 7, vacancy: 'Product Manager',           date: '2026-03-21', time: '14:30', interviewer: 'Carol White', status: 'Bekor qilindi', resumeUrl: '#', feedback: 'Nomzod kelmadi.' },
  { id: 7, candidate: 'Otabek Xolmatov',  vacancyId: 1, vacancy: 'Senior React Developer',   date: todayStr,  time: '16:00', interviewer: 'Carol White', status: 'Kutilmoqda',   resumeUrl: '#', feedback: '' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const VACANCY_STATUS_META = {
  'Ochiq':    { cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'Yopilgan': { cls: 'bg-red-100 text-red-600',      dot: 'bg-red-500' },
  'Arxiv':    { cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

export const INTERVIEW_STATUS_META = {
  'Kutilmoqda':    { cls: 'bg-blue-100 text-blue-700' },
  'Yakunlandi':    { cls: 'bg-green-100 text-green-700' },
  'Bekor qilindi': { cls: 'bg-red-100 text-red-600' },
};

export const fmtSalary = (n) => `${(n / 1_000_000).toFixed(1)}M UZS`;
