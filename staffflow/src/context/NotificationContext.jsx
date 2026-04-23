import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getNotificationsForRole, ALL_NOTIFICATIONS, NOTIF_TYPE } from '../utils/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Simulated "real-time" new notifications per role
const REALTIME_POOL = {
  admin: [
    { type: NOTIF_TYPE.SUCCESS, title: 'Yangi xodim ro\'yxatdan o\'tdi', message: 'Yangi xodim tizimga qo\'shildi.' },
    { type: NOTIF_TYPE.INFO,    title: 'Hisobot tayyor',                  message: 'Mart oyi hisoboti yaratildi.' },
  ],
  hr_manager: [
    { type: NOTIF_TYPE.WARNING, title: 'Kech kelish',                    message: 'Bugun 2 xodim kech keldi.' },
    { type: NOTIF_TYPE.INFO,    title: 'Intervyu eslatmasi',              message: 'Keyingi intervyu 30 daqiqadan so\'ng.' },
  ],
  team_lead: [
    { type: NOTIF_TYPE.WARNING, title: 'Vazifa muddati',                 message: 'Bitta vazifa muddati bugun tugaydi.' },
    { type: NOTIF_TYPE.SUCCESS, title: 'Vazifa bajarildi',               message: 'Jamoa a\'zosi vazifani yakunladi.' },
  ],
  employee: [
    { type: NOTIF_TYPE.INFO,    title: 'Yangi vazifa',                   message: 'Sizga yangi vazifa tayinlandi.' },
    { type: NOTIF_TYPE.WARNING, title: 'Muddat eslatmasi',               message: 'Vazifa muddati yaqinlashmoqda.' },
  ],
};

export function NotificationProvider({ children }) {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const poolIndexRef = useRef(0);

  // Load role-based notifications when auth changes
  useEffect(() => {
    if (auth?.role) {
      setNotifications(getNotificationsForRole(auth.role));
      poolIndexRef.current = 0;
    } else {
      setNotifications([]);
    }
  }, [auth?.role]);

  // Simulate real-time notification every 30 seconds
  useEffect(() => {
    if (!auth?.role) return;
    const pool = REALTIME_POOL[auth.role] ?? [];
    if (pool.length === 0) return;

    const interval = setInterval(() => {
      const item = pool[poolIndexRef.current % pool.length];
      poolIndexRef.current += 1;

      const newNotif = {
        id: Date.now(),
        roles: [auth.role],
        type: item.type,
        title: item.title,
        message: item.message,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications(prev => [newNotif, ...prev]);
      setToast(newNotif);
      setTimeout(() => setToast(null), 4000);
    }, 30_000);

    return () => clearInterval(interval);
  }, [auth?.role]);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, toast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
