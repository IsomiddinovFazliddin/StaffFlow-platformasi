import { useState } from 'react';
import { INTERVIEW_STATUS_META } from '../../utils/hrData';

const STATUSES = ['Kutilmoqda', 'Yakunlandi', 'Bekor qilindi'];

export default function FeedbackModal({ interview, onSave, onClose }) {
  const [feedback, setFeedback] = useState(interview.feedback ?? '');
  const [status, setStatus]     = useState(interview.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...interview, feedback, status });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Intervyu natijasi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Candidate info */}
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800">{interview.candidate}</p>
            <p className="text-xs text-gray-500 mt-0.5">{interview.vacancy}</p>
            <p className="text-xs text-gray-400 mt-1">{interview.date} · {interview.time} · {interview.interviewer}</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Holat</label>
            <div className="flex gap-2">
              {STATUSES.map(s => {
                const meta = INTERVIEW_STATUS_META[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 text-xs py-2 rounded-lg font-medium border transition-colors
                      ${status === s ? `${meta.cls} border-transparent` : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Feedback</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Nomzod haqida fikr-mulohazalaringizni yozing..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
