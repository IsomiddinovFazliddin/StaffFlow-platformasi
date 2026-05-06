export const EMPLOYEES = [
  { id:1, name:'Jasur Aliyev',    dept:'IT',        efficiency:95, attendance:98, tasksDone:92, salary:5000000, trend:+8  },
  { id:2, name:'Alii Karimov',    dept:'IT',        efficiency:60, attendance:85, tasksDone:55, salary:4500000, trend:-3  },
  { id:3, name:'Asad Toshmatov',  dept:'Marketing', efficiency:60, attendance:80, tasksDone:58, salary:6000000, trend:+2  },
  { id:4, name:'Vali Yusupov',    dept:'Moliya',    efficiency:60, attendance:90, tasksDone:65, salary:5500000, trend:+1  },
  { id:5, name:'Sobir Rahimov',   dept:'HR',        efficiency:60, attendance:60, tasksDone:50, salary:4000000, trend:-8  },
];

export const MONTHLY_TREND = [
  { month:'Noy', attendance:82, efficiency:65, tasks:60 },
  { month:'Dek', attendance:78, efficiency:61, tasks:55 },
  { month:'Yan', attendance:80, efficiency:63, tasks:62 },
  { month:'Fev', attendance:85, efficiency:68, tasks:66 },
  { month:'Mar', attendance:89, efficiency:73, tasks:71 },
  { month:'Apr', attendance:87, efficiency:73, tasks:68 },
];

export const DEPARTMENTS = [
  { name:'IT',        headcount:2, efficiency:77, attendance:91, tasks:73, salary:9500000  },
  { name:'Marketing', headcount:1, efficiency:60, attendance:80, tasks:58, salary:6000000  },
  { name:'Moliya',    headcount:1, efficiency:60, attendance:90, tasks:65, salary:5500000  },
  { name:'HR',        headcount:1, efficiency:60, attendance:60, tasks:50, salary:4000000  },
];

export const calcScore = (e) =>
  Math.round(e.efficiency * 0.4 + e.attendance * 0.3 + e.tasksDone * 0.3);

export const getBadge = (e) => {
  const s = calcScore(e);
  if (s > 90)       return { label:'Champion', cls:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
  if (s >= 75)      return { label:'Yulduz',   cls:'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' };
  if (e.trend > 10) return { label:"O'smoqda", cls:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' };
  if (s < 50)       return { label:'Diqqat',   cls:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
  return { label:'Normal', cls:'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300' };
};

export const getDeptStatus = (d) => {
  if (d.efficiency < 50 || d.attendance < 50 || d.tasks < 50)
    return { label:'Muammoli', cls:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
  if (d.efficiency > 75 && d.attendance > 75 && d.tasks > 75)
    return { label:"A'lo",    cls:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' };
  return { label:"O'rta",   cls:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
};

export const fmtUZS = (n) => Number(n).toLocaleString('uz-UZ') + " so'm";
