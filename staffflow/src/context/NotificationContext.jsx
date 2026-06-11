import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationBus } from '../utils/notificationBus';

const NotificationContext = createContext(null);

export const NOTIF_TYPE = {
  INFO:    'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR:   'error',
};

const LS_KEY = 'sf_notifications';

const loadAll = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
};

const saveAll = (list) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200))); }
  catch { /* ignore */ }
};

export function NotificationProvider({ children }) {
  const { auth } = useAuth();
  const [all, setAll]     = useState(() => loadAll());
  const [toast, setToast] = useState(null);

  // Reload when user changes
  useEffect(() => {
    setAll(loadAll());
  }, [auth?.id]);

  // Listen to bus events (from AppContext, AuthContext, etc.)
  useEffect(() => {
    const unsub = notificationBus.subscribe((notif) => {
      setAll(prev => {
        const updated = [notif, ...prev];
        saveAll(updated);
        return updated;
      });
      // Show toast only if relevant to current user
      const isForMe = (
        !notif.userId ||
        notif.userId === 'all' ||
        notif.userId === auth?.id ||
        (notif.userId === 'admin' && auth?.role === 'admin')
      );
      if (isForMe) {
        setToast(notif);
        setTimeout(() => setToast(null), 4000);
      }
    });
    return unsub;
  }, [auth?.id, auth?.role]);

  // Filter notifications for current user
  const notifications = all.filter(n => {
    if (!auth) return false;
    if (n.userId === auth.id)                              return true;
    if (n.userId === 'admin' && auth.role === 'admin')     return true;
    if (n.userId === 'all')                                return true;
    return false;
  });

  // unreadCount — defined BEFORE it's used anywhere
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add notification programmatically (also available via bus)
  const addNotification = useCallback(({ userId, type, title, message, relatedId, relatedType }) => {
    const notif = {
      id:          Date.now(),
      userId:      userId ?? 'all',
      type:        type ?? NOTIF_TYPE.INFO,
      title,
      message,
      read:        false,
      createdAt:   new Date().toISOString(),
      relatedId:   relatedId ?? null,
      relatedType: relatedType ?? null,
    };
    notificationBus.emit(notif);
    return notif;
  }, []);

  const markRead = useCallback((id) => {
    setAll(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveAll(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setAll(prev => {
      const updated = prev.map(n => {
        const isForMe = (
          n.userId === auth?.id ||
          n.userId === 'all' ||
          (n.userId === 'admin' && auth?.role === 'admin')
        );
        return isForMe ? { ...n, read: true } : n;
      });
      saveAll(updated);
      return updated;
    });
  }, [auth?.id, auth?.role]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications: setAll,
      unreadCount,
      markRead,
      markAllRead,
      addNotification,
      toast,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
