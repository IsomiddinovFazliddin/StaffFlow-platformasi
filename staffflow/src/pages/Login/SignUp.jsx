import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const isFirstUser = () => {
  try {
    const accounts = JSON.parse(localStorage.getItem('sf_accounts')) || [];
    return accounts.length === 0;
  } catch { return true; }
};

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const firstUser = isFirstUser();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim())  return setError('Ism kiritilishi shart');
    if (!form.email.trim()) return setError('Email kiritilishi shart');
    if (form.password.length < 6) return setError('Parol kamida 6 ta belgi bo\'lishi kerak');
    if (form.password !== form.confirm) return setError('Parollar mos kelmadi');

    setLoading(true);
    const result = register({ name: form.name, email: form.email, password: form.password });
    setLoading(false);

    if (result.error) return setError(result.error);

    const role = result.user.role;
    navigate(['admin', 'hr_manager', 'team_lead'].includes(role) ? '/admin' : '/employee', { replace: true });
  };

  const inp = {
    padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%',
  };
  const lbl = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eef2ff,#fff,#f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#4f46e5', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>StaffFlow HRM</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Yangi hisob yaratish</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '32px' }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>To'liq ism</label>
              <input type="text" value={form.name} onChange={set('name')}
                placeholder="Ismingizni kiriting" required style={inp} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="email@staffflow.com" required style={inp} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Parol</label>
              <input type="password" value={form.password} onChange={set('password')}
                placeholder="Kamida 6 ta belgi" required style={inp} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Parolni tasdiqlang</label>
              <input type="password" value={form.confirm} onChange={set('confirm')}
                placeholder="Parolni qayta kiriting" required style={inp} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* First user hint */}
            <div style={{ background: firstUser ? '#f0fdf4' : '#eff6ff', border: `1px solid ${firstUser ? '#bbf7d0' : '#bfdbfe'}`, color: firstUser ? '#166534' : '#1e40af', fontSize: '12px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px' }}>
              {firstUser
                ? '💡 Siz birinchi foydalanuvchisiz — avtomatik <strong>Admin</strong> rolini olasiz.'
                : 'ℹ️ Yangi hisob <strong>Xodim</strong> sifatida yaratiladi. Admin tomonidan rol o\'zgartirilishi mumkin.'}
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#4f46e5', color: '#fff', fontWeight: '600', fontSize: '15px', padding: '11px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Hisobingiz bormi?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
              Kirish
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>StaffFlow HRM v2.0</p>
      </div>
    </div>
  );
}
