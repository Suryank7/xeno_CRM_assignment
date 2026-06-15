import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    outline: 'none',
    fontSize: '14px',
    color: '#111827',
    marginBottom: '20px'
  };

  const socialBtnStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151'
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#fff' }}>
      
      {/* LEFT SIDE - FORM */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '60px' }}>
          <div style={{ width: '32px', height: '32px', background: '#7C3AED', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#111827' }}>Xeno</span>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', flex: 1 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            {isLogin ? 'Welcome Back' : 'Get Started Now'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>
            Enter your credentials to access your account
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button style={socialBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Log in with Google
            </button>
            <button style={socialBtnStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#111"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.26.45 3.09.45.71 0 2.02-.45 3.39-.45 1.81.05 3.13.55 4.34 1.7-2.08 1.25-1.68 3.55-.54 4.5.17.15.35.25.56.36-.71 2.2-1.92 4.41-2.84 5.41zm-4.73-12.7c-.15-1.8 1.4-3.52 3.14-3.58.26 1.95-1.72 3.55-3.14 3.58z"/></svg>
              Log in with Apple
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
                {error}
              </div>
            )}
            {!isLogin && (
              <>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Name</label>
                <input required type="text" placeholder="John Doe" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
              </>
            )}

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Email address</label>
            <input required type="email" placeholder="john@company.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Password</label>
              {isLogin && <a href="#" style={{ fontSize: '13px', color: '#7C3AED', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>}
            </div>
            <input required type="password" placeholder="min 6 chars" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />

            {!isLogin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input required type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }} />
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>I agree to the <b>Terms & Privacy</b></span>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '12px', background: '#7C3AED',
              color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer',
              opacity: loading ? 0.7 : 1, transition: '0.2s', marginTop: isLogin ? '12px' : '0'
            }}>
              {loading ? 'Authenticating...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div style={{ marginTop: '24px', fontSize: '14px', color: '#374151', fontWeight: 500 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: '#7C3AED', cursor: 'pointer', fontWeight: 600 }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: 'auto', textAlign: 'center' }}>
          2026 Xeno Pulse, All right Reserved
        </div>
      </div>

      {/* RIGHT SIDE - VISUAL */}
      <div style={{ flex: 1, background: '#7C3AED', padding: '60px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '16px', maxWidth: '400px', lineHeight: 1.3 }}>
          The smartest way to scale your growth
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '60px' }}>
          Autonomous campaign execution powered by AI.
        </p>

        {/* Dashboard Mockup floating graphic */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          flex: 1,
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 10
        }}>
          {/* Mockup Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ fontWeight: 600, fontSize: '18px' }}>Dashboard</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F3F4F6' }}></div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E5E7EB' }}></div>
            </div>
          </div>

          {/* Mockup Stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ flex: 1, background: '#F9FAFB', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Active Campaigns</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>12.4k</div>
            </div>
            <div style={{ flex: 1, background: '#F9FAFB', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Revenue Lift</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>+34%</div>
            </div>
          </div>

          {/* Mockup Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD'][i-1] }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ width: '60%', height: '8px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '6px' }}></div>
                  <div style={{ width: '40%', height: '6px', background: '#F3F4F6', borderRadius: '3px' }}></div>
                </div>
                <div style={{ width: '40px', height: '16px', background: '#E5E7EB', borderRadius: '8px' }}></div>
              </div>
            ))}
          </div>

          {/* Floating modal mock */}
          <div style={{
            position: 'absolute', right: '-40px', top: '100px', width: '240px',
            background: '#fff', borderRadius: '12px', padding: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Create Agent</div>
            <div style={{ width: '100%', height: '32px', background: '#F3F4F6', borderRadius: '6px', marginBottom: '12px' }}></div>
            <div style={{ width: '100%', height: '32px', background: '#7C3AED', borderRadius: '6px' }}></div>
          </div>
        </div>

        {/* Logos at bottom */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '40px', opacity: 0.7 }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>Google</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>Spotify</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>stripe</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>Booking.com</span>
        </div>
      </div>
    </div>
  );
}
