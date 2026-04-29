import { useTranslate } from '../../hooks/useTranslate';

const styles = {
  'Pending':     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Done':        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Present':     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Absent':      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Active':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'On Leave':    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'High':        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Medium':      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Low':         'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',
  'Paid':        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Pending':     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export default function Badge({ label }) {
  const t = useTranslate();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[label] ?? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>
      {t(`badge.${label}`, {}) !== `badge.${label}` ? t(`badge.${label}`) : label}
    </span>
  );
}
