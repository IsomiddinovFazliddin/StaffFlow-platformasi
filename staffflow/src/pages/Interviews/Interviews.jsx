import { useState } from 'react';
import { interviews as initialInterviews, INTERVIEW_STATUS_META } from '../../utils/hrData';
import { KEYS, loadOrDefault, persist } from '../../utils/storage';
import InterviewCalendar from './InterviewCalendar';
import FeedbackModal from './FeedbackModal';

const STATUSES = ['Barchasi', 'Kutilmoqda', 'Yakunlandi', 'Bekor qilindi'];

const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

function dateBadge(dateStr) {
  if (dateStr === todayStr) {
    return <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Bugun</span>;
  }
  if (dateStr === tomorrowStr) {
    return <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Ertaga</span>;
  }
  return null;
}

function timeUntilToday(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
  if (diff <= 0)  return <span className="text-xs text-red-500 font-medium">Hozir</span>;
  if (diff <= 30) return <span className="text-xs text-orange-500 font-medium">Tez orada ({diff} daq)</span>;
  return null;
}

export default function Interviews() {
  const [interviews, setInterviews] = useState(() => loadOrDefault(KEYS.INTERVIEWS, initialInterviews));
  const [filterStatus, setFilterStatus] = useState('Barchasi');
  const [search, setSearch]         = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const filtered = interviews.filter(iv => {
    const matchStatus = filterStatus === 'Barchasi' || iv.status === filterStatus;
    const matchSearch = iv.candidate.toLowerCase().includes(search.toLowerCase()) ||
                        iv.vacancy.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSaveFeedback = (updated) => {
    setInterviews(prev => {
      const next = prev.map(iv => iv.id === updated.id ? updated : iv);
      persist(KEYS.INTERVIEWS, next);
      return next;
    });
    setFeedbackTarget(null);
  };

  const pending   = interviews.filter(iv => iv.status === 'Kutilmoqda').length;
  const done      = interviews.filter(iv => iv.status === 'Yakunlandi').length;
  const cancelled = interviews.filter(iv => iv.status === 'Bekor qilindi').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Intervyular</h1>
        <p className="text-sm text-gray-400 mt-0.5">Nomzodlar bilan uchrashuvlarni boshqarish</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{pending}</p>
          <p className="text-xs text-gray-500 mt-1">Kutilmoqda</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{done}</p>
          <p className="text-xs text-gray-500 mt-1">Yakunlandi</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-500">{cancelled}</p>
          <p className="text-xs text-gray-500 mt-1">Bekor qilindi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 w-52"
              placeholder="Nomzod yoki vakansiya..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex gap-1">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors
                    ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Interview cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🎤</p>
                <p className="text-sm">Intervyular topilmadi</p>
              </div>
            )}
            {filtered.map(iv => {
              const meta = INTERVIEW_STATUS_META[iv.status] ?? INTERVIEW_STATUS_META['Kutilmoqda'];
              const isToday = iv.date === todayStr;
              return (
                <div key={iv.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow
                    ${isToday ? 'border-violet-200' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm shrink-0">
                        {iv.candidate[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{iv.candidate}</p>
                          {dateBadge(iv.date)}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{iv.vacancy}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Intervyuer: {iv.interviewer}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-sm font-bold text-violet-700">{iv.time}</span>
                        {isToday && timeUntilToday(iv.time)}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{iv.date}</p>
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${meta.cls}`}>
                        {iv.status}
                      </span>
                    </div>
                  </div>

                  {/* Feedback preview */}
                  {iv.feedback && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 italic">
                      "{iv.feedback}"
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setFeedbackTarget(iv)}
                      className="text-xs px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 font-medium transition-colors"
                    >
                      📝 Feedback yozish
                    </button>
                    {iv.resumeUrl && iv.resumeUrl !== '#' && (
                      <a
                        href={iv.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                      >
                        📄 Rezyume
                      </a>
                    )}
                    {iv.resumeUrl === '#' && (
                      <span className="text-xs px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed">
                        📄 Rezyume yo'q
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: calendar */}
        <div>
          <InterviewCalendar interviews={interviews} />
        </div>
      </div>

      {/* Feedback modal */}
      {feedbackTarget && (
        <FeedbackModal
          interview={feedbackTarget}
          onSave={handleSaveFeedback}
          onClose={() => setFeedbackTarget(null)}
        />
      )}
    </div>
  );
}
