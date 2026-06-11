/**
 * notificationBus.js — Simple event bus for cross-context notifications.
 * AppContext calls emit(), NotificationContext listens.
 */

const listeners = new Set();

export const notificationBus = {
  emit(notif) {
    listeners.forEach(fn => fn(notif));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
