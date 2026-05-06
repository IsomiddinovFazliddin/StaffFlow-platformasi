import { useState, useMemo, useRef } from 'react';
import { X, Download, Printer, ChevronUp, ChevronDown, Search, BarChart2, Table } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { generateReportPDF } from '../utils/pdfExporter';

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const fmtUZS = n => Number(n).toLocaleString('uz-UZ') + ' so\'m';
const fmtDate = (d = new Date()) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// ── Build report data from appData ────────────────────────────────────────────
function buildData(reportId, appData, filters) {
  const { employees = [], attendance = [], tasks = [], salaries = [], penalties = [] } = appData;
  const { dept, search } = filters;

  const filterEmp = (list) => list.filter(e => {
    if (dept && e.department !== dept) return false;
    if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  switch (reportId) {
    case 'xodimlar': {
      const rows = filterEmp(employees).map(e => ({
        'FIO': e.name, 'Lavozim': e.role || '—', "Bo'lim": e.department || '—',
        "Qo'shilgan": e.joinDate || '—', 'Holat': e.status || 'Faol',
        'Maosh': fmtUZS((e.salary || 0) * 12800),
      }));
      const cols = ['FIO', 'Lavozim', "Bo'lim", "Qo'shilgan", 'Holat', 'Maosh'];
      const summary = [
        { label: 'Jami xodimlar', value: rows.length },
        { label: 'Faol', value: rows.filter(r => r['Holat'] === 'Faol' || r['Holat'] === 'Active').length },
        { label: "Ta'tilda", value: rows.filter(r => r['Holat'] === 'On Leave').length },
      ];
      const chart = employees.reduce((acc, e) => {
        const d = e.department || 'Boshqa';
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {});
      return { rows, cols, summary, chartData: Object.entries(chart).map(([name, count]) => ({ name, count })), chartKey: 'count', chartLabel: 'Xodimlar' };
    }
    case 'davomat': {
      const rows = filterEmp(attendance).map(a => ({
        'Xodim': a.name, 'Sana': a.date, 'Kirish': a.checkIn || '—',
        'Chiqish': a.checkOut || '—', 'Holat': a.status,
        'Kechikdi': a.late ? 'Ha' : 'Yo\'q',
      }));
      const cols = ['Xodim', 'Sana', 'Kirish', 'Chiqish', 'Holat', 'Kechikdi'];
      const present = rows.filter(r => r['Holat'] === 'Present').length;
      const summary = [
        { label: 'Jami yozuvlar', value: rows.length },
        { label: 'Keldi', value: present },
        { label: 'Kelmadi', value: rows.filter(r => r['Holat'] === 'Absent').length },
        { label: 'Kechikdi', value: rows.filter(r => r['Kechikdi'] === 'Ha').length },
      ];
      const chart = [
        { name: 'Keldi', count: present },
        { name: 'Kelmadi', count: rows.length - present },
        { name: 'Kechikdi', count: rows.filter(r => r['Kechikdi'] === 'Ha').length },
      ];
      return { rows, cols, summary, chartData: chart, chartKey: 'count', chartLabel: 'Soni' };
    }
    case 'maosh': {
      const rows = filterEmp(salaries.map(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        return { ...s, name: s.name || emp?.name || '—', department: emp?.department || '—' };
      })).map(s => ({
        'Xodim': s.name, 'Lavozim': s.role || '—', 'Oy': s.month,
        'Asosiy': fmtUZS(s.base * 12800), 'Bonus': fmtUZS(s.bonus * 12800),
        'Chegirma': fmtUZS(s.deductions * 12800), 'Jami': fmtUZS(s.net * 12800),
        'Holat': s.status === 'Paid' ? "To'landi" : 'Kutilmoqda',
      }));
      const cols = ['Xodim', 'Lavozim', 'Oy', 'Asosiy', 'Bonus', 'Chegirma', 'Jami', 'Holat'];
      const total = salaries.reduce((s, r) => s + r.net, 0);
      const summary = [
        { label: 'Jami xodimlar', value: rows.length },
        { label: "To'langan", value: salaries.filter(s => s.status === 'Paid').length },
        { label: 'Jami summa', value: fmtUZS(total * 12800) },
      ];
      const chart = salaries.map(s => ({ name: s.name, jami: s.net * 12800 }));
      return { rows, cols, summary, chartData: chart, chartKey: 'jami', chartLabel: 'Maosh (so\'m)' };
    }
    case 'vazifalar': {
      const rows = tasks.map(t => ({
        'Vazifa': t.title, "Mas'ul": t.assignee || '—',
        'Muhimlik': t.priority, 'Holat': t.status, 'Muddat': t.due || '—',
      }));
      const cols = ['Vazifa', "Mas'ul", 'Muhimlik', 'Holat', 'Muddat'];
      const done = rows.filter(r => r['Holat'] === 'Done').length;
      const summary = [
        { label: 'Jami vazifalar', value: rows.length },
        { label: 'Bajarildi', value: done },
        { label: 'Jarayonda', value: rows.filter(r => r['Holat'] === 'In Progress').length },
        { label: 'Kutilmoqda', value: rows.filter(r => r['Holat'] === 'Pending').length },
      ];
      const chart = [
        { name: 'Bajarildi', count: done },
        { name: 'Jarayonda', count: rows.filter(r => r['Holat'] === 'In Progress').length },
        { name: 'Kutilmoqda', count: rows.filter(r => r['Holat'] === 'Pending').length },
      ];
      return { rows, cols, summary, chartData: chart, chartKey: 'count', chartLabel: 'Vazifalar' };
    }
    case 'jarima': {
      const rows = penalties.map(p => ({
        'Xodim': p.employeeName, 'Sana': p.date, 'Sabab': p.reason,
        'Ball': p.points, 'Oy': p.month,
      }));
      const cols = ['Xodim', 'Sana', 'Sabab', 'Ball', 'Oy'];
      const totalPts = penalties.reduce((s, p) => s + p.points, 0);
      const summary = [
        { label: 'Jami jarimalar', value: rows.length },
        { label: 'Jami ball', value: totalPts },
      ];
      const chart = penalties.reduce((acc, p) => {
        const ex = acc.find(a => a.name === p.employeeName);
        if (ex) ex.ball += Math.abs(p.points);
        else acc.push({ name: p.employeeName, ball: Math.abs(p.points) });
        return acc;
      }, []);
      return { rows, cols, summary, chartData: chart, chartKey: 'ball', chartLabel: 'Ball' };
    }
    case 'umumiy':
    default: {
      const rows = employees.map(e => {
        const sal = salaries.find(s => s.employeeId === e.id);
        const att = attendance.filter(a => a.employeeId === e.id);
        const tsk = tasks.filter(t => t.assigneeId === e.id);
        const pen = penalties.filter(p => p.employeeId === e.id);
        return {
          'Xodim': e.name, "Bo'lim": e.department || '—',
          'Davomat': `${att.filter(a => a.status === 'Present').length}/${att.length}`,
          'Vazifalar': `${tsk.filter(t => t.status === 'Done').length}/${tsk.length}`,
          'Maosh': sal ? fmtUZS(sal.net * 12800) : '—',
          'Jarima ball': pen.reduce((s, p) => s + p.points, 0),
        };
      });
      const cols = ['Xodim', "Bo'lim", 'Davomat', 'Vazifalar', 'Maosh', 'Jarima ball'];
      const summary = [
        { label: 'Jami xodimlar', value: employees.length },
        { label: 'Jami vazifalar', value: tasks.length },
        { label: 'Bajarildi', value: tasks.filter(t => t.status === 'Done').length },
        { label: 'Jami jarimalar', value: penalties.length },
      ];
      return { rows, cols, summary, chartData: employees.map(e => ({ name: e.name, xodim: 1 })), chartKey: 'xodim', chartLabel: 'Xodim' };
    }
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReportPreview({ reportId, report, appData, onClose, onDownload }) {
  const [view,    setView]    = useState('both'); // chart | table | both
  const [search,  setSearch]  = useState('');
  const [dept,    setDept]    = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const depts = [...new Set((appData.employees || []).map(e => e.department).filter(Boolean))];
  const { rows, cols, summary, chartData, chartKey, chartLabel } = useMemo(
    () => buildData(reportId, appData, { dept, search }),
    [reportId, appData, dept, search]
  );

  const sorted = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? ''; const bv = b[sortCol] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [rows, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handlePDF = async () => {
    setLoading(true);
    try {
      await generateReportPDF({ reportId, report, rows: sorted, cols, summary, chartData });
      onDownload?.();
    } catch (e) { alert('PDF yaratishda xato: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400">
              <X size={18} />
            </button>
            <h2 className="font-semibold text-gray-800 dark:text-slate-100">{report?.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <select value={dept} onChange={e => { setDept(e.target.value); setPage(1); }}
              className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none">
              <option value="">Barcha bo'limlar</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Qidirish..." className="pl-7 pr-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none w-36" />
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
              <Printer size={13} /> Chop
            </button>
            <button onClick={handlePDF} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium disabled:opacity-60">
              <Download size={13} /> {loading ? 'Tayyorlanmoqda...' : 'PDF'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Report header */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{report?.title}</h1>
              <span className="text-xs text-gray-400 dark:text-slate-500">Yaratilgan: {fmtDate()}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">{report?.desc}</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary.map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            {[['chart', 'Grafik', BarChart2], ['table', 'Jadval', Table], ['both', 'Ikkalasi', null]].map(([v, l, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${view === v ? 'bg-indigo-600 text-white' : 'border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                {Icon && <Icon size={13} />}{l}
              </button>
            ))}
          </div>

          {/* Chart */}
          {(view === 'chart' || view === 'both') && chartData.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-4">{report?.title} — grafik</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey={chartKey} fill="#6366f1" radius={[4,4,0,0]} name={chartLabel} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          {(view === 'table' || view === 'both') && (
            <div ref={tableRef} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600">
                    <tr>
                      {cols.map(col => (
                        <th key={col} onClick={() => handleSort(col)}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            {col}
                            {sortCol === col ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                    {paged.length === 0 ? (
                      <tr><td colSpan={cols.length} className="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">
                        Hech qanday ma'lumot topilmadi
                      </td></tr>
                    ) : paged.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        {cols.map(col => (
                          <td key={col} className="px-4 py-3 text-gray-700 dark:text-slate-300 text-xs whitespace-nowrap max-w-[200px] truncate">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <span>Sahifada:</span>
                  {[10, 25, 50].map(n => (
                    <button key={n} onClick={() => { setPerPage(n); setPage(1); }}
                      className={`px-2 py-0.5 rounded ${perPage === n ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500 dark:text-slate-400">{sorted.length} ta yozuv</span>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40">‹</button>
                  <span className="text-gray-600 dark:text-slate-300">{page}/{totalPages || 1}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40">›</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
