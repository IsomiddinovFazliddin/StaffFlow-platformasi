import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../utils/mockData';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const LS_KEY   = (empId) => `sf_attendance_${empId}`;
const nowTime  = () => new Date().toTimeString().slice(0, 5);
const todayStr = () => new Date().toISOString().split('T')[0];

// Work schedule constants
const WORK_START = '09:00'; // late if after this
const WORK_END   = '18:00'; // checkout allowed after this

const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const isLate = (t) => toMins(t) > toMins(WORK_START);
const isWorkDone = (t) => toMins(t) >= toMins(WORK_END);

const calcHours = (inT, outT) => {
  const diff = toMins(outT) - toMins(inT);
  return diff > 0 ? diff : 0; // minutes
};

// Format minutes → "Xh Ym"
const fmtDuration = (mins) => {
  if (!mins || mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}s` : `${h}s ${m}m`;
};

// Time remaining until 18:00
const timeUntilEnd = (now) => {
  const diff = toMins(WORK_END) - toMins(now);
  return diff > 0 ? diff : 0;
};

function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  const colors = { success: 'bg-emerald-600', warning: 'bg-yellow-500', info: 'bg-blue-600', error: 'bg-red-600' };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium ${colors[type] ?? colors.info}`}
      style={{ animation: 'slideUp 0.3s ease' }}>
      {message}
    </div>
  );
}

const OFFICE = { lat: 41.2995, lng: 69.2401 };
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function checkGeo() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve({ ok: true, msg: null }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = distKm(pos.coords.latitude, pos.coords.longitude, OFFICE.lat, OFFICE.lng);
        resolve({ ok: true, msg: dist > 5 ? `📍 Ofisdan ${dist.toFixed(1)} km uzoqdasiz (simulyatsiya)` : null });
      },
      () => resolve({ ok: true, msg: null })
    );
  });
}

function StatusBadge({ status, late }) {
  if (late)             return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      Kechikdi
    </span>
  );
  if (status === 'Present') return <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">✅ Keldi</span>;
  if (status === 'Absent')  return <span className="text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">❌ Kelmadi</span>;
  return <Badge label={status} />;
}

// Handle both decimal hours (mock data) and integer minutes (session)
const displayDuration = (val) => {
  if (!val || val === 0) return '—';
  // If it's a small number (< 24), treat as decimal hours from mock data
  if (val < 24) {
    const totalMins = Math.round(val * 60);
    return fmtDuration(totalMins);
  }
  // Otherwise treat as minutes (from session)
  return fmtDuration(val);
};

export default function Attendance() {
  const { attendance, checkIn: ctxCheckIn, checkOut: ctxCheckOut, toggleAttendance, employees } = useApp();
  const { can, auth } = useAuth();

  const canManage  = can(PERMISSIONS.MANAGE_ATTENDANCE);
  const canViewAll = can(PERMISSIONS.VIEW_ALL_ATTENDANCE);
  const canCheckin = can(PERMISSIONS.CHECKIN);

  const lsKey  = LS_KEY(auth?.employeeId ?? 'guest');
  const loadLS = () => { try { return JSON.parse(localStorage.getItem(lsKey)) || null; } catch { return null; } };

  const [session, setSession]   = useState(() => loadLS());
  const [toast, setToast]       = useState(null);
  const [geoMsg, setGeoMsg]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [liveClock, setLiveClock] = useState(nowTime());
  const [earlyModal, setEarlyModal] = useState(false); // early checkout confirm

  useEffect(() => {
    const t = setInterval(() => {
      const now = nowTime();
      setLiveClock(now);
      // Auto-checkout at 18:00
      setSession(prev => {
        if (prev?.status === 'working' && isWorkDone(now)) {
          const mins = calcHours(prev.checkIn, WORK_END);
          const updated = { ...prev, status: 'finished', checkOut: WORK_END, workHours: mins };
          localStorage.setItem(lsKey, JSON.stringify(updated));
          if (auth?.employeeId) ctxCheckOut(auth.employeeId);
          setToast({ message: `🏁 Ish vaqti yakunlandi (18:00). Bugun ${fmtDuration(mins)} ishladingiz.`, type: 'info' });
          return updated;
        }
        return prev;
      });
    }, 30_000);
    return () => clearInterval(t);
  }, [auth?.employeeId]);

  const elapsed = session?.status === 'working' && session.checkIn ? calcHours(session.checkIn, liveClock) : null;
  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleCheckIn = async () => {
    if (session?.status === 'working') return;
    setLoading(true);
    const geo = await checkGeo();
    setLoading(false);
    if (geo.msg) setGeoMsg(geo.msg);
    const time = nowTime();
    const late = isLate(time);
    const newSession = { status: 'working', checkIn: time, checkOut: null, date: todayStr(), workHours: null, late };
    setSession(newSession);
    localStorage.setItem(lsKey, JSON.stringify(newSession));
    if (auth?.employeeId) ctxCheckIn(auth.employeeId);
    // Add penalty for late arrival
    if (late && auth?.employeeId) {
      try {
        const { addPenalty } = await import('../../context/PenaltyContext');
        // penalty added via context below
      } catch { /* ignore */ }
    }
    showToast(
      late
        ? `⚠️ Kech keldingiz (${time}). Ish vaqti 09:00 dan boshlanadi. Jarima ball qo'shildi.`
        : `✅ Xush kelibsiz! Ish vaqtingiz boshlandi — ${time}`,
      late ? 'warning' : 'success'
    );
  };

  const handleCheckOut = () => {
    if (session?.status !== 'working') return;
    const now = nowTime();

    if (canManage) {
      // Admin can always checkout
      doCheckOut(now);
      return;
    }

    // Employee: only allowed after 18:00 OR if admin granted early permission
    const earlyPermKey = `sf_early_checkout_${auth?.employeeId}_${todayStr()}`;
    const hasPermission = localStorage.getItem(earlyPermKey) === 'granted';

    if (isWorkDone(now) || hasPermission) {
      doCheckOut(now);
    } else {
      // Show info — cannot checkout, need admin permission
      setEarlyModal(true);
    }
  };

  const doCheckOut = (time = nowTime()) => {
    const mins = calcHours(session.checkIn, time);
    const updated = { ...session, status: 'finished', checkOut: time, workHours: mins };
    setSession(updated);
    localStorage.setItem(lsKey, JSON.stringify(updated));
    if (auth?.employeeId) ctxCheckOut(auth.employeeId);
    setEarlyModal(false);
    showToast(`🏁 Ish yakunlandi! Bugun ${fmtDuration(mins)} ishladingiz.`, 'info');
  };

  // Build visible records based on role
  // Admin hech qachon davomat jadvalida ko'rinmaydi
  const isNotAdmin = (a) => {
    const emp = employees.find(e => e.id === a.employeeId || String(e.id) === String(a.employeeId));
    return !emp || (emp.accountRole !== 'admin' && emp.role !== 'admin');
  };

  const records = (() => {
    const role = auth?.role;
    if (role === 'employee') {
      return attendance.filter(a => a.employeeId === auth?.employeeId || String(a.employeeId) === String(auth?.id));
    }
    if (role === 'team_lead') {
      const leadEmp  = employees.find(e => e.id === auth?.employeeId || e.id === auth?.id);
      const leadDept = leadEmp?.department;
      const deptEmpIds = new Set(
        employees
          .filter(e => e.accountRole !== 'admin' && e.role !== 'admin' &&
                       (!leadDept || e.department === leadDept))
          .map(e => e.id)
      );
      if (auth?.employeeId) deptEmpIds.add(auth.employeeId);
      if (auth?.id) deptEmpIds.add(auth.id);
      return attendance.filter(a => deptEmpIds.has(a.employeeId));
    }
    // Admin sees all — but NOT admin users
    return attendance.filter(isNotAdmin);
  })();

  const presentCount = records.filter(a => a.status === 'Present').length;
  const lateCount    = records.filter(a => a.late).length;
  const rate         = records.length ? Math.round((presentCount / records.length) * 100) : 0;
  const today        = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Davomat</h1>
        <p className="text-gray-400 text-sm mt-0.5">Bugun · {today}</p>
      </div>

      {/* Check-in / Check-out panel */}
      {canCheckin && !canManage && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Bugungi holat</p>
              {!session || session.status === 'not_started' ? (
                <p className="text-xs text-gray-400">Hali ish boshlanmagan</p>
              ) : session.status === 'working' ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-700">Ishda — {session.checkIn} dan</span>
                    {session.late && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">⚠️ Kechikdi</span>}
                  </div>
                  <p className="text-xs text-gray-400">Hozircha: {fmtDuration(elapsed)} ishlandi</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-700">✅ Ish yakunlandi · {session.checkIn} – {session.checkOut}</p>
                  <p className="text-xs text-gray-500">Jami: <strong>{fmtDuration(session.workHours)}</strong></p>
                  {session.late && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">⚠️ Kechikdi</span>}
                </div>
              )}
              {geoMsg && <p className="text-xs text-orange-500 mt-1">{geoMsg}</p>}
            </div>

            <div className="flex gap-4 shrink-0">
              <button onClick={handleCheckIn}
                disabled={session?.status === 'working' || session?.status === 'finished' || loading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${session?.status === 'working' ? 'bg-emerald-500 text-white animate-pulse cursor-default'
                    : session?.status === 'finished' ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {session?.status === 'working' ? 'Ishdasiz' : 'Ishni boshlash'}
              </button>
              <div className="flex flex-col items-end gap-1">
                <button onClick={handleCheckOut}
                  disabled={session?.status !== 'working'}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${session?.status === 'working'
                      ? 'bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Ishni yakunlash
                </button>
                {session?.status === 'working' && !isWorkDone(liveClock) && !canManage && (
                  <p className="text-xs text-amber-500">
                    ⏰ {fmtDuration(timeUntilEnd(liveClock))} qoldi (18:00 gacha)
                  </p>
                )}
              </div>
            </div>

            {/* Work schedule info */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center gap-4 text-xs text-gray-400">
              <span>🕘 Ish vaqti: <strong className="text-gray-600 dark:text-slate-300">09:00 — 18:00</strong></span>
              <span>⚠️ Kechikish: <strong className="text-gray-600 dark:text-slate-300">09:00 dan keyin</strong></span>
            </div>
          </div>

          {session?.status === 'working' && elapsed && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Ish soati jarayoni</span>
                <span>{fmtDuration(elapsed)} / 8 soat</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((elapsed / 480) * 100, 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {canViewAll && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Keldi',      value: presentCount,                     color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Kelmadi',    value: attendance.length - presentCount, color: 'text-red-500',     bg: 'bg-red-50' },
            { label: 'Kech keldi', value: lateCount,                        color: 'text-yellow-500',  bg: 'bg-yellow-50' },
            { label: 'Davomat %',  value: `${rate}%`,                       color: 'text-indigo-600',  bg: 'bg-indigo-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Mobile card list ── */}
      <div className="md:hidden space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Davomat jadvali</h2>
        {records.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Ma'lumot topilmadi</p>
        ) : records.map(record => (
          <div key={record.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                {record.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{record.name}</p>
                <p className="text-xs text-gray-400">{record.date}</p>
              </div>
              <StatusBadge status={record.status} late={record.late} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Kirish</p>
                <p className="font-mono font-medium text-gray-700">{record.checkIn ?? '—'}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Chiqish</p>
                <p className="font-mono font-medium text-gray-700">{record.checkOut ?? '—'}</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-2">
                <p className="text-gray-400 mb-0.5">Ish soati</p>
                <p className="font-medium text-gray-700">{displayDuration(record.workHours)}</p>
              </div>
            </div>
            {canManage && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">Holat o'zgartirish</span>
                <button onClick={() => toggleAttendance(record.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                    ${record.status === 'Present' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300
                    ${record.status === 'Present' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Davomat jadvali</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Xodim', 'Sana', 'Kirish', 'Chiqish', 'Ish soati', 'Holat', canManage ? 'Boshqarish' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Ma'lumot topilmadi</td></tr>
              )}
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                        {record.name[0]}
                      </div>
                      <p className="font-medium text-gray-800">{record.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{record.date}</td>
                  <td className="px-5 py-4 text-gray-600 font-mono">{record.checkIn ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-600 font-mono">{record.checkOut ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{displayDuration(record.workHours)}</td>
                  <td className="px-5 py-4"><StatusBadge status={record.status} late={record.late} /></td>
                  {canManage && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleAttendance(record.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                            ${record.status === 'Present' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300
                            ${record.status === 'Present' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        {/* Early checkout permission button */}
                        {record.status === 'Present' && !record.checkOut && (
                          <button
                            onClick={() => {
                              const key = `sf_early_checkout_${record.employeeId}_${record.date}`;
                              const current = localStorage.getItem(key);
                              if (current === 'granted') {
                                localStorage.removeItem(key);
                                showToast(`${record.name} uchun chiqish ruxsati bekor qilindi`, 'warning');
                              } else {
                                localStorage.setItem(key, 'granted');
                                showToast(`✅ ${record.name} uchun chiqish ruxsati berildi`, 'success');
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                              localStorage.getItem(`sf_early_checkout_${record.employeeId}_${record.date}`) === 'granted'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                            }`}
                            title="Vaqtidan oldin chiqishga ruxsat"
                          >
                            {localStorage.getItem(`sf_early_checkout_${record.employeeId}_${record.date}`) === 'granted'
                              ? '✅ Ruxsat berildi'
                              : '🔓 Ruxsat berish'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Early checkout confirmation modal */}
      {earlyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100">Chiqish mumkin emas</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">
              Ish vaqti hali tugamagan. Ish vaqti <strong>18:00</strong> gacha davom etadi.
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              🚫 Vaqtidan oldin ketish uchun <strong>admin ruxsati</strong> kerak.
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">
              Admin davomat sahifasida sizga chiqish ruxsatini berishi mumkin.
            </p>
            <button onClick={() => setEarlyModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
              Tushundim, qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
