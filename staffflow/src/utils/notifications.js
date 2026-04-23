// ─── Notification types ───────────────────────────────────────────────────────
export const NOTIF_TYPE = {
  INFO:    'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR:   'error',
};

// ─── Type → icon & colors ─────────────────────────────────────────────────────
export const TYPE_META = {
  info:    { icon: 'ℹ️',  bg: 'bg-blue-100',   dot: 'bg-blue-500',   text: 'text-blue-700' },
  success: { icon: '✅',  bg: 'bg-green-100',  dot: 'bg-green-500',  text: 'text-green-700' },
  warning: { icon: '⚠️',  bg: 'bg-yellow-100', dot: 'bg-yellow-500', text: 'text-yellow-700' },
  error:   { icon: '🚨',  bg: 'bg-red-100',    dot: 'bg-red-500',    text: 'text-red-700' },
};

// ─── Role-based mock notifications ───────────────────────────────────────────
// roles: admin | hr_manager | team_lead | employee
const now = Date.now();
const mins = (m) => new Date(now - m * 60_000).toISOString();

export const ALL_NOTIFICATIONS = [
  // ── Admin ────────────────────────────────────────────────────────────────
  { id: 201, roles: ['admin'], type: NOTIF_TYPE.ERROR,   title: 'Tizim xatosi aniqlandi',         message: 'Auth moduli 3 marta muvaffaqiyatsiz urinish qayd etdi.',  read: false, createdAt: mins(5) },
  { id: 202, roles: ['admin'], type: NOTIF_TYPE.WARNING, title: 'Yuqori CPU yuklanishi',           message: 'Server CPU 92% ga yetdi. Tekshirib ko\'ring.',             read: false, createdAt: mins(20) },
  { id: 203, roles: ['admin'], type: NOTIF_TYPE.SUCCESS, title: 'Yangi xodim qo\'shildi',         message: 'Grace Kim Engineering bo\'limiga qo\'shildi.',             read: false, createdAt: mins(2) },
  { id: 204, roles: ['admin'], type: NOTIF_TYPE.INFO,    title: 'Tizim yangilandi',                message: 'StaffFlow v2.1 muvaffaqiyatli o\'rnatildi.',               read: false, createdAt: mins(30) },
  { id: 205, roles: ['admin'], type: NOTIF_TYPE.WARNING, title: 'Litsenziya muddati',              message: 'Litsenziya 7 kundan so\'ng tugaydi.',                      read: true,  createdAt: mins(120) },
  { id: 206, roles: ['admin'], type: NOTIF_TYPE.INFO,    title: 'Faoliyat ogohlantirishi',         message: '5 ta yangi amal qayd etildi.',                            read: true,  createdAt: mins(240) },

  // ── HR Manager ───────────────────────────────────────────────────────────
  { id: 301, roles: ['hr_manager'], type: NOTIF_TYPE.SUCCESS, title: 'Yangi xodim qo\'shildi',    message: 'Frank Brown Marketing bo\'limiga qo\'shildi.',                   read: false, createdAt: mins(3) },
  { id: 302, roles: ['hr_manager'], type: NOTIF_TYPE.WARNING, title: 'Kech kelish aniqlandi',     message: 'Bob Smith bugun 09:45 da keldi (15 daqiqa kech).',               read: false, createdAt: mins(15) },
  { id: 303, roles: ['hr_manager'], type: NOTIF_TYPE.WARNING, title: 'Davomat muammosi',          message: 'Carol White va David Lee bugun kelmadi.',                        read: true,  createdAt: mins(45) },
  { id: 304, roles: ['hr_manager'], type: NOTIF_TYPE.SUCCESS, title: 'Maosh tasdiqlandi',         message: 'Mart 2026 ish haqi to\'lovlari tasdiqlandi.',                    read: true,  createdAt: mins(90) },
  { id: 305, roles: ['hr_manager'], type: NOTIF_TYPE.INFO,    title: 'Intervyu eslatmasi',        message: 'Bugun soat 14:00 da Jasur Toshmatov bilan intervyu.',            read: false, createdAt: mins(10) },

  // ── Team Lead ────────────────────────────────────────────────────────────
  { id: 401, roles: ['team_lead'], type: NOTIF_TYPE.INFO,    title: 'Yangi vazifa tayinlandi',    message: '"API integration" vazifasi David Lee ga tayinlandi.',            read: false, createdAt: mins(8) },
  { id: 402, roles: ['team_lead'], type: NOTIF_TYPE.SUCCESS, title: 'Vazifa bajarildi',           message: 'Alice Johnson "Fix login bug" vazifasini yakunladi.',            read: false, createdAt: mins(25) },
  { id: 403, roles: ['team_lead'], type: NOTIF_TYPE.WARNING, title: 'Muddat yaqinlashmoqda',      message: '"API integration" muddati 2026-04-15 — 3 kun qoldi.',           read: true,  createdAt: mins(60) },
  { id: 404, roles: ['team_lead'], type: NOTIF_TYPE.ERROR,   title: 'Kechiktirilgan vazifa',      message: '"Design onboarding" muddati o\'tib ketdi.',                     read: false, createdAt: mins(40) },
  { id: 405, roles: ['team_lead'], type: NOTIF_TYPE.INFO,    title: 'Jamoa samaradorligi',        message: 'Bu hafta 3 ta vazifa bajarildi, 4 ta kutilmoqda.',               read: true,  createdAt: mins(180) },

  // ── Employee ─────────────────────────────────────────────────────────────
  { id: 501, roles: ['employee'], type: NOTIF_TYPE.INFO,    title: 'Yangi vazifa tayinlandi',     message: '"User research interviews" sizga tayinlandi.',                  read: false, createdAt: mins(5) },
  { id: 502, roles: ['employee'], type: NOTIF_TYPE.WARNING, title: 'Muddat yaqinlashmoqda',       message: '"User research" muddati 2026-04-05 — 12 kun qoldi.',            read: false, createdAt: mins(30) },
  { id: 503, roles: ['employee'], type: NOTIF_TYPE.INFO,    title: 'Davomat eslatmasi',           message: 'Bugun kirish vaqtingiz: 09:02. Ish soati: 9.05h.',              read: true,  createdAt: mins(120) },
  { id: 504, roles: ['employee'], type: NOTIF_TYPE.SUCCESS, title: 'Maosh o\'tkazildi',           message: 'Mart 2026 ish haqi hisobingizga o\'tkazildi.',                  read: true,  createdAt: mins(240) },
  { id: 505, roles: ['employee'], type: NOTIF_TYPE.SUCCESS, title: 'Vazifa bajarildi',            message: '"Fix login bug" muvaffaqiyatli yakunlandi.',                    read: true,  createdAt: mins(360) },
];

// ─── Filter by role ───────────────────────────────────────────────────────────
export function getNotificationsForRole(role) {
  return ALL_NOTIFICATIONS
    .filter(n => n.roles.includes(role))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─── Format relative time ─────────────────────────────────────────────────────
export function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)   return `${diff} soniya oldin`;
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}
