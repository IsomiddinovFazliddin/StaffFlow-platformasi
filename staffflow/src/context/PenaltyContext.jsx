import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const PenaltyContext = createContext(null);

// ── Penalty types ─────────────────────────────────────────────────────────────
export const PENALTY_TYPES = {
  LATE_CHECKIN: { key: 'late_checkin',   label: 'Kech kelish (15+ daqiqa)', points: -1 },
  TASK_OVERDUE: { key: 'task_overdue',   label: 'Vazifani kech topshirish',  points: -2 },
  TASK_MISSED:  { key: 'task_missed',    label: 'Vazifani bajarmaslik',      points: -3 },
  MANUAL:       { key: 'manual',         label: 'Qo\'lda qo\'shilgan',       points: 0  },
};

const DEFAULT_CONFIG = { pointValue: 50000 };

const normalizePenalty = (p) => ({
  id:           p._id || p.id,
  employeeId:   p.userId?._id || p.userId || p.employeeId,
  employeeName: p.userId?.name || p.employeeName || '',
  type:         p.type || 'MANUAL',
  points:       p.points || -1,
  reason:       p.reason || '',
  month:        p.month || '',
  date:         p.date || '',
  createdAt:    p.createdAt || '',
});

export function PenaltyProvider({ children }) {
  const { auth } = useAuth();
  const [penalties, setPenalties] = useState([]);
  const [config,    setConfig]    = useState(DEFAULT_CONFIG);
  const [loading,   setLoading]   = useState(false);

  const fetchPenalties = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const res = await api.penalties.list();
      setPenalties((res.penalties || []).map(normalizePenalty));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [auth?.token]);

  useEffect(() => { fetchPenalties(); }, [fetchPenalties]);

  const addPenalty = async ({ employeeId, employeeName, type, points, reason, month }) => {
    try {
      const res = await api.penalties.create({ userId: employeeId, type, points, reason, month });
      const entry = normalizePenalty({ ...res.penalty, userId: { _id: employeeId, name: employeeName } });
      setPenalties(prev => [...prev, entry]);
      return entry;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const removePenalty = async (id) => {
    try {
      await api.penalties.delete(id);
      setPenalties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const getEmployeePenalties = (employeeId, month) =>
    penalties.filter(p =>
      p.employeeId === employeeId && (!month || p.month === month)
    );

  const getEmployeePoints = (employeeId, month) =>
    getEmployeePenalties(employeeId, month).reduce((sum, p) => sum + p.points, 0);

  const getDeduction = (employeeId, month) =>
    Math.abs(getEmployeePoints(employeeId, month)) * config.pointValue;

  const updateConfig = (patch) => setConfig(prev => ({ ...prev, ...patch }));

  return (
    <PenaltyContext.Provider value={{
      penalties, config,
      addPenalty, removePenalty,
      getEmployeePenalties, getEmployeePoints, getDeduction,
      updateConfig, loading, refetch: fetchPenalties,
    }}>
      {children}
    </PenaltyContext.Provider>
  );
}

export const usePenalty = () => useContext(PenaltyContext);
