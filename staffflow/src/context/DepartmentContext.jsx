import { createContext, useContext, useState } from 'react';
import { departments as deptData } from '../utils/mockData';
import { KEYS, loadOrDefault, persist } from '../utils/storage';

const DepartmentContext = createContext(null);

export function DepartmentProvider({ children }) {
  const [departments, setDepartments] = useState(
    () => loadOrDefault(KEYS.DEPARTMENTS, deptData)
  );

  const _set = (updater) => {
    setDepartments(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(KEYS.DEPARTMENTS, next);
      return next;
    });
  };

  const addDepartment = (name) => {
    const trimmed = name.trim().replace(/^\w/, c => c.toUpperCase());
    if (!trimmed) return { error: true, errorKey: 'errorRequired' };
    const exists = departments.some(d => d.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return { error: true, errorKey: 'errorExists' };
    _set(prev => [...prev, { id: Date.now(), name: trimmed }]);
    return {};
  };

  const deleteDepartment = (id) =>
    _set(prev => prev.filter(d => d.id !== id));

  return (
    <DepartmentContext.Provider value={{ departments, addDepartment, deleteDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export const useDepartments = () => useContext(DepartmentContext);
