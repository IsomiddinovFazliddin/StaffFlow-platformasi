import { VACANCY_STATUS_META, fmtSalary } from '../../utils/hrData';

export default function VacancyList({ vacancies, onEdit, onClose, onViewCandidates }) {
  if (vacancies.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm">Vakansiyalar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {vacancies.map(v => {
        const meta = VACANCY_STATUS_META[v.status] ?? VACANCY_STATUS_META['Arxiv'];
        return (
          <div key={v.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 leading-tight">{v.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{v.department}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${meta.cls}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${meta.dot}`} />
                {v.status}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="bg-gray-50 px-2 py-1 rounded-lg">💰 {fmtSalary(v.salaryMin)} – {fmtSalary(v.salaryMax)}</span>
              <span className="bg-gray-50 px-2 py-1 rounded-lg">🎓 {v.experience}</span>
              <span className="bg-gray-50 px-2 py-1 rounded-lg">👤 {v.candidates} nomzod</span>
            </div>

            <p className="text-xs text-gray-400">Qo'shilgan: {v.createdAt}</p>

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-1">
              <button
                onClick={() => onViewCandidates(v)}
                className="flex-1 text-xs py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 font-medium transition-colors"
              >
                👁 Nomzodlar
              </button>
              <button
                onClick={() => onEdit(v)}
                className="flex-1 text-xs py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
              >
                ✏️ Tahrirlash
              </button>
              {v.status === 'Ochiq' && (
                <button
                  onClick={() => onClose(v.id)}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                >
                  🔒 Yopish
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
