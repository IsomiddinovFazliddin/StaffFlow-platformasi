/**
 * StaffFlow Modern Logo
 * Flow yozuvi uchun yorqinroq va bilinadigan ranglar qo'shildi
 */
export default function Logo({ collapsed = false, variant = 'dark', className = '' }) {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-5 select-none ${className} transition-all duration-300`}>

      {/* ── S+F Modern Icon Mark ── */}
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform transition-transform"
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 6H11C9.34315 6 8 7.34315 8 9C8 10.6569 9.34315 12 11 12H13C14.6569 12 16 13.3431 16 15C16 16.6569 14.6569 18 13 18H7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 6V18M17 12H20M17 6H20"
            stroke="#A5F3FC"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── Wordmark ── */}
      {!collapsed && (
        <div
          className="hidden sm:flex items-center overflow-hidden whitespace-nowrap"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span
            className={`text-[19px] font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}
          >
            Staff
          </span>
          <span
            className={`text-[19px] font-bold tracking-tight ml-0.5 
              ${isLight 
                ? 'text-cyan-600'
                : 'text-cyan-300'
              }`}
          >
            Flow
          </span>
        </div>
      )}

    </div>
  );
}