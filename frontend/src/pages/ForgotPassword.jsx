import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Minimal theme logic to read from localStorage/html class
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('https://crm-native-ai-1.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Minimal clean CSS */
        .xp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F9FAFB;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
        }
        .xp-card {
          width: 100%;
          maxWidth: 440px;
          background: #ffffff;
          padding: 48px;
          border-radius: 20px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .xp-inp {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          background: #F9FAFB;
          font-size: 16px;
          transition: all 0.2s;
          color: #111827;
        }
        .xp-inp:focus {
          border-color: #06B6D4;
          outline: none;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
        }
        .xp-btn {
          width: 100%;
          padding: 16px;
          background: #06B6D4;
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }
        .xp-btn:hover { background: #0891B2; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,0.3); }
        .xp-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        
        .dark .xp-root { background: #0a0a0f; }
        .dark .xp-card { background: #111118; border-color: #1e1e2a; box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
        .dark .xp-inp { background: #1a1a24; border-color: #2a2a38; color: #f3f4f6; }
        .dark .xp-inp:focus { background: #1c1810; border-color: #06B6D4; }

        .xp-msg { padding: 14px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; }
        .xp-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .dark .xp-msg.error { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.2); color: #f87171; }
        .xp-msg.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .dark .xp-msg.success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.2); color: #4ade80; }
      `}</style>
      
      <div className="xp-root">
        {/* Theme Toggle Top Right */}
        <div style={{ position:'absolute', top:22, right:26, display:'flex', gap:8 }}>
          <button onClick={() => setIsDark(false)} style={{ width:38, height:38, borderRadius:'50%', border:'1.5px solid', borderColor: !isDark?'#06B6D4':'#E5E7EB', background: !isDark?'#FFF1E6':'transparent', cursor:'pointer', color:'#06B6D4' }}>
            ☀️
          </button>
          <button onClick={() => setIsDark(true)} style={{ width:38, height:38, borderRadius:'50%', border:'1.5px solid', borderColor: isDark?'#22D3EE':'#E5E7EB', background: isDark?'rgba(99,102,241,0.1)':'transparent', cursor:'pointer', color:'#22D3EE' }}>
            🌙
          </button>
        </div>

        <div className="xp-card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 20, background: '#fff', borderRadius: 16, padding: 6, boxShadow: '0 8px 24px rgba(79,70,229,0.4)', border: '2px solid rgba(79,70,229,0.3)' }}>
              <img src="/pwa-192x192.svg" alt="Logo" style={{ width: 48, height: 48 }} />
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, color: isDark ? '#fff' : '#111827', margin: 0 }}>Reset Password</h2>
            <p style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: 8, lineHeight: 1.5 }}>
              Enter your email and your new password to instantly update your credentials.
            </p>
          </div>

          {error && <div className="xp-msg error">{error}</div>}
          {message && <div className="xp-msg success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: isDark ? '#d1d5db' : '#374151', marginBottom: 8 }}>Email address</label>
              <input type="email" required className="xp-inp" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: isDark ? '#d1d5db' : '#374151', marginBottom: 8 }}>New Password</label>
              <input type="password" required className="xp-inp" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
            </div>
            <button type="submit" className="xp-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/login" style={{ color: '#06B6D4', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
