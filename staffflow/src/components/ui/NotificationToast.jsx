import { useNotifications } from '../../context/NotificationContext';
import { TYPE_META } from '../../utils/notifications';

export default function NotificationToast() {
  const { toast } = useNotifications();

  if (!toast) return null;

  const meta = TYPE_META[toast.type] ?? TYPE_META.info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[fadeScaleIn_0.2s_ease-out]">
      <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl shadow-2xl px-4 py-3 max-w-sm">
        <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center text-base shrink-0`}>
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">{toast.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
