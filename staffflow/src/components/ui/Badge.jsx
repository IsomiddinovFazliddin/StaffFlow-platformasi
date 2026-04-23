import { useTranslate } from '../../hooks/useTranslate';

const styles = {
  'Pending':     'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done':        'bg-emerald-100 text-emerald-700',
  'Present':     'bg-emerald-100 text-emerald-700',
  'Absent':      'bg-red-100 text-red-700',
  'Active':      'bg-emerald-100 text-emerald-700',
  'On Leave':    'bg-orange-100 text-orange-700',
  'High':        'bg-red-100 text-red-700',
  'Medium':      'bg-yellow-100 text-yellow-700',
  'Low':         'bg-gray-100 text-gray-600',
};

export default function Badge({ label }) {
  const t = useTranslate();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[label] ?? 'bg-gray-100 text-gray-600'}`}>
      {t(`badge.${label}`, {}) !== `badge.${label}` ? t(`badge.${label}`) : label}
    </span>
  );
}
