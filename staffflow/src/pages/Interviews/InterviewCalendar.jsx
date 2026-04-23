// Simple calendar widget showing interview dates for the current month
const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const MONTHS_UZ = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

export default function InterviewCalendar({ interviews }) {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Normalize: Mon=0 ... Sun=6
  const startOffset = (firstDay + 6) % 7;

  // Build set of days that have interviews
  const interviewDays = new Set(
    interviews
      .filter(iv => {
        const d = new Date(iv.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(iv => new Date(iv.date).getDate())
  );

  const todayDate = today.getDate();

  // Build grid cells
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        📅 {MONTHS_UZ[month]} {year}
      </h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const isToday     = day === todayDate;
          const hasInterview = interviewDays.has(day);
          return (
            <div
              key={day}
              className={`relative flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-medium transition-colors
                ${isToday ? 'bg-violet-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              {day}
              {hasInterview && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
              )}
              {hasInterview && isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Bu oyda {interviewDays.size} ta intervyu rejalashtirilgan
      </p>
    </div>
  );
}
