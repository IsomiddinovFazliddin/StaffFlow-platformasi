import { useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useNotifications } from '../../context/NotificationContext';
import { TYPE_META, timeAgo } from '../../utils/notifications';

export default function NotificationDropdown({ open, onClose }) {
  const ref = useRef(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  useClickOutside(ref, () => { if (open) onClose(); });

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-screen max-w-sm sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden"
      style={{ maxWidth: 'min(384px, calc(100vw - 16px))' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">Bildirishnomalar</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Barchasini o'qilgan deb belgilash
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400 dark:text-slate-500 text-sm">
            <p className="text-3xl mb-2">🔔</p>
            Bildirishnomalar yo'q
          </div>
        ) : (
          notifications.map(n => {
            const meta = TYPE_META[n.type] ?? TYPE_META.info;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                  hover:bg-gray-50 dark:hover:bg-slate-700
                  ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center text-base shrink-0 mt-0.5`}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read
                    ? 'font-semibold text-gray-800 dark:text-slate-100'
                    : 'font-medium text-gray-600 dark:text-slate-300'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <span className={`w-2 h-2 rounded-full ${meta.dot} shrink-0 mt-2`} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 text-center">
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {notifications.length} ta bildirishnoma · {unreadCount} ta o'qilmagan
          </span>
        </div>
      )}
    </div>
  );
}
