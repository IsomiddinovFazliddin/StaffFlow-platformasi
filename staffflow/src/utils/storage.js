/**
 * storage.js — Centralized localStorage abstraction layer.
 *
 * All keys are prefixed with "sf_" to avoid collisions.
 * Swap these functions for real API calls when a backend is ready.
 */

export const KEYS = {
  EMPLOYEES:   'sf_employees',
  DEPARTMENTS: 'sf_departments',
  TASKS:       'sf_tasks',
  ATTENDANCE:  'sf_attendance',
  SALARIES:    'sf_salaries',
  VACANCIES:   'sf_vacancies',
  INTERVIEWS:  'sf_interviews',
  ACTIVITY:    'sf_activity_logs',
};

/** Read a value from localStorage. Returns `null` if missing or parse fails. */
export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Write a value to localStorage. */
export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode — fail silently
  }
}

/** Remove a key from localStorage. */
export function storageRemove(key) {
  localStorage.removeItem(key);
}

/**
 * Load persisted data or fall back to the provided default.
 * Use this in useState initialisers:
 *   const [items, setItems] = useState(() => loadOrDefault(KEYS.EMPLOYEES, empData));
 */
export function loadOrDefault(key, defaultData) {
  return storageGet(key) ?? defaultData;
}

/**
 * Persist helper — call after every state mutation.
 * Returns the new state so it can be used inline.
 */
export function persist(key, data) {
  storageSet(key, data);
  return data;
}

/** Clear all StaffFlow keys from localStorage (full reset to mock data). */
export function clearAllStorage() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
