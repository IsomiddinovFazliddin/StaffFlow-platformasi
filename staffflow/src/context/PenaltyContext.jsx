import { createContext, useContext, useState } from 'react';
import { KEYS, loadOrDefault, persist } from '../utils/storage';

const PenaltyContext = createContext(null);

// ── Penalty types ─────────────────────────────────────────────────────────────
export const PENALTY_TYPES = {
  LATE_CHECKIN:   { key: 'late_checkin',   label: 'Kech kelish (15+ daqiqa)', points: -1 },
  TASK_OVERDUE:   { key: 'task_overdue',   label: 'Vazifani kech topshirish',  points: -2 },
  TASK_MISSED:    { key: 'task_missed',    label: 'Vazifani bajarmaslik',      points: -3 },
  MANUAL:         { key: 'manual',         label: 'Qo\'lda qo\'shilgan',       points: 0  },
};

const DEFAULT_CONFIG = {
  pointValue: 50000, // UZS per point
};

export function PenaltyProvider({ children }) {
  const [penalties, setPenalties] = useState(() =>
    loadOrDefault(KEYS.PENALTIES, [])
  );
  const [config, setConfig] = useState(() =>
    loadOrDefault(KEYS.PENALTY_CFG, DEFAULT_CONFIG)
  );

  const save = (list) => { setPenalties(list); persist(KEYS.PENALTIES, list); };

  // Add a penalty record
  const addPenalty = ({ employeeId, employeeName, type, points, reason, month }) => {
    const entry = {
      id:           Date.now(),
      employeeId,
      employeeName,
      type,
      points,       // negative number
      reason:       reason || PENALTY_TYPES[type]?.label || type,
      month:        month || new Date().toISOString().slice(0, 7), // 'YYYY-MM'
      date:         new Date().toISOString().split('T')[0],
      createdAt:    new Date().toISOString(),
    };
    save([...penalties, entry]);
    return entry;
  };

  // Remove a penalty
  const removePenalty = (id) => save(penalties.filter(p => p.id !== id));

  // Get penalties for a specific employee
  const getEmployeePenalties = (employeeId, month) =>
    penalties.filter(p =>
      p.employeeId === employeeId &&
      (!month || p.month === month)
    );

  // Total points for employee in a month
  const getEmployeePoints = (employeeId, month) =>
    getEmployeePenalties(employeeId, month).reduce((sum, p) => sum + p.points, 0);

  // Total deduction in UZS
  const getDeduction = (employeeId, month) =>
    Math.abs(getEmployeePoints(employeeId, month)) * config.pointValue;

  // Update config (admin)
  const updateConfig = (patch) => {
    const updated = { ...config, ...patch };
    setConfig(updated);
    persist(KEYS.PENALTY_CFG, updated);
  };

  return (
    <PenaltyContext.Provider value={{
      penalties, config,
      addPenalty, removePenalty,
      getEmployeePenalties, getEmployeePoints, getDeduction,
      updateConfig,
    }}>
      {children}
    </PenaltyContext.Provider>
  );
}

export const usePenalty = () => useContext(PenaltyContext);
