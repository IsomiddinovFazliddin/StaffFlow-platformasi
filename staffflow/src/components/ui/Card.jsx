export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 ${className}`}>
      {children}
    </div>
  );
}
