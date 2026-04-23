import { useState } from 'react';
import { vacancies as initialVacancies } from '../../utils/hrData';
import { KEYS, loadOrDefault, persist } from '../../utils/storage';
import VacancyList from './VacancyList';
import VacancyModal from './VacancyModal';

const DEPARTMENTS = ['Barchasi', 'Engineering', 'Design', 'HR', 'Marketing', 'Finance', 'Product'];
const STATUSES    = ['Barchasi', 'Ochiq', 'Yopilgan', 'Arxiv'];

export default function Vacancies() {
  const [vacancies, setVacancies]   = useState(() => loadOrDefault(KEYS.VACANCIES, initialVacancies));
  const [filterDept, setFilterDept] = useState('Barchasi');
  const [filterStatus, setFilterStatus] = useState('Barchasi');
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(null); // null | 'add' | vacancy object
  const [toast, setToast]           = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = vacancies.filter(v => {
    const matchDept   = filterDept   === 'Barchasi' || v.department === filterDept;
    const matchStatus = filterStatus === 'Barchasi' || v.status     === filterStatus;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const _setVacancies = (updater) => {
    setVacancies(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(KEYS.VACANCIES, next);
      return next;
    });
  };

  const handleSave = (data) => {
    _setVacancies(prev => {
      const exists = prev.find(v => v.id === data.id);
      return exists ? prev.map(v => v.id === data.id ? data : v) : [data, ...prev];
    });
    showToast(vacancies.find(v => v.id === data.id) ? 'Vakansiya yangilandi' : "Yangi vakansiya qo'shildi");
    setModal(null);
  };

  const handleClose = (id) => {
    _setVacancies(prev => prev.map(v => v.id === id ? { ...v, status: 'Yopilgan' } : v));
    showToast('Vakansiya yopildi');
  };

  const handleViewCandidates = (v) => {
    showToast(`"${v.title}" uchun ${v.candidates} ta nomzod mavjud`);
  };

  const openCount   = vacancies.filter(v => v.status === 'Ochiq').length;
  const closedCount = vacancies.filter(v => v.status === 'Yopilgan').length;
  const totalCandidates = vacancies.reduce((s, v) => s + v.candidates, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Vakansiyalar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Ochiq ish o'rinlarini boshqarish</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
        >
          + Yangi vakansiya
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-violet-600">{openCount}</p>
          <p className="text-xs text-gray-500 mt-1">Ochiq</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-500">{closedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Yopilgan</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCandidates}</p>
          <p className="text-xs text-gray-500 mt-1">Jami nomzodlar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 w-56"
          placeholder="Qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400 self-center">{filtered.length} ta natija</span>
      </div>

      {/* List */}
      <VacancyList
        vacancies={filtered}
        onEdit={setModal}
        onClose={handleClose}
        onViewCandidates={handleViewCandidates}
      />

      {/* Modal */}
      {modal !== null && (
        <VacancyModal
          vacancy={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-violet-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
