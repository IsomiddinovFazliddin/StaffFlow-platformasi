import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const DepartmentContext = createContext(null);

const normalizeDept = (d) => ({
  id:        d._id || d.id,
  name:      d.name,
  managerId: d.managerId?._id || d.managerId || null,
  manager:   d.managerId?.name || null,
});

export function DepartmentProvider({ children }) {
  const { auth } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const fetchDepartments = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const res = await api.departments.list();
      setDepartments((res.departments || []).map(normalizeDept));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  // Sahifa focus bo'lganda ham qayta yuklash
  useEffect(() => {
    const onFocus = () => { if (auth?.token) fetchDepartments(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [auth?.token, fetchDepartments]);

  const addDepartment = async (name) => {
    const trimmed = name.trim().replace(/^\w/, c => c.toUpperCase());
    if (!trimmed) return { error: true, errorKey: 'errorRequired' };
    try {
      const res = await api.departments.create({ name: trimmed });
      setDepartments(prev => [...prev, normalizeDept(res.department)]);
      return {};
    } catch (err) {
      // Backend "allaqachon mavjud" xatosini qaytarsa
      if (err.message?.toLowerCase().includes('unique') || err.message?.toLowerCase().includes('allaqachon') || err.message?.toLowerCase().includes('mavjud')) {
        return { error: true, errorKey: 'errorExists' };
      }
      return { error: true, errorKey: 'errorExists', message: err.message };
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.departments.delete(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DepartmentContext.Provider value={{
      departments, addDepartment, deleteDepartment,
      loading, error, refetch: fetchDepartments,
    }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export const useDepartments = () => useContext(DepartmentContext);
