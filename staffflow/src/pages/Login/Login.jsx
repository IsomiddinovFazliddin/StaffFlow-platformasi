import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_REDIRECT = {
  admin:      '/admin',
  hr_manager: '/admin',
  team_lead:  '/admin',
  employee:   '/employee',
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    const redirect = ROLE_REDIRECT[result.user.role] ?? '/employee';
    navigate(redirect, { replace: true });
  };

  const inp = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };
  const lbl = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eef2ff,#fff,#f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#4f46e5', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>StaffFlow HRM</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Tizimga kirish</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@staffflow.com" required style={inp} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Parol</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Parolni kiriting" required style={inp} />
            </div>

            {/* Toast-style error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#4f46e5', color: '#fff', fontWeight: '600', fontSize: '15px', padding: '11px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
            Hali hisobingiz yo'qmi?{' '}
            <Link to="/register" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
              Ro'yxatdan o'ting
            </Link>
          </div>

          {/* Reset — admin parolini unutgan holat */}
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Barcha hisoblar o\'chiriladi va qayta ro\'yxatdan o\'tishingiz kerak bo\'ladi. Davom etasizmi?')) {
                  localStorage.removeItem('sf_accounts');
                  localStorage.removeItem('sf_auth');
                  window.location.href = '/register';
                }
              }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Parolni unutdingizmi? Tizimni tiklash
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>StaffFlow HRM v2.0</p>
      </div>
    </div>
  );
}
