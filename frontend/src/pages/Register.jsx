import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/* ── Icons ── */
const IconUser   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMail   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const IconLock   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IconEyeOn  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
const IconEyeOff = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>;
const GoogleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;

/* ── Mini Line Chart ── */
const LineChart = () => (
  <svg width="100%" height="70" viewBox="0 0 260 70" preserveAspectRatio="none" fill="none">
    <defs>
      <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F97316" stopOpacity="0.18"/>
        <stop offset="100%" stopColor="#F97316" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <path d="M0 55 L30 50 L55 52 L80 45 L105 38 L130 40 L160 30 L185 22 L210 14 L235 10 L260 6"
      stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M0 55 L30 50 L55 52 L80 45 L105 38 L130 40 L160 30 L185 22 L210 14 L235 10 L260 6 V70 H0Z"
      fill="url(#lcg)"/>
    {[[0,55],[30,50],[55,52],[80,45],[105,38],[130,40],[160,30],[185,22],[210,14],[235,10],[260,6]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#F97316" strokeWidth="1.5"/>
    ))}
    {['May 1','May 9','May 15','May 21','May 28','Jun 4'].map((l, i) => (
      <text key={l} x={8 + i * 50} y="68" fontSize="9" fill="#9CA3AF" textAnchor="middle">{l}</text>
    ))}
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };

  useEffect(() => {
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme','dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme','light'); }
  }, [isDark]);

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await axios.post('https://crm-native-ai-1.onrender.com/api/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.email || form.email);
      navigate('/dashboard');
    } catch (err) {
      setError(!err.response ? 'Cannot reach server. Is the backend running?' : err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

        /* ═══════════ LIGHT MODE (default) ═══════════ */
        .xp-root {
          display:flex; min-height:100vh;
          font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
          --xp-bg: #fff;
          --xp-left-bg: #FDF8F4;
          --xp-left-border: #F0ECE8;
          --xp-right-bg: #fff;
          --xp-text: #111827;
          --xp-text-secondary: #374151;
          --xp-text-muted: #6B7280;
          --xp-text-faint: #9CA3AF;
          --xp-card-bg: #fff;
          --xp-card-border: rgba(0,0,0,0.04);
          --xp-card-shadow: 0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          --xp-card-hover-shadow: 0 8px 30px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --xp-input-bg: #F9FAFB;
          --xp-input-border: #E5E7EB;
          --xp-input-focus-bg: #FFFBF7;
          --xp-badge-bg: #FFF1E6;
          --xp-badge-border: #C7D2FE;
          --xp-feat-bg: #fff;
          --xp-stat-bg: #fff;
          --xp-ai-card-bg: #EEF2FF;
          --xp-ai-card-border: #C7D2FE;
          --xp-dropdown-bg: #F3F4F6;
          --xp-right-shadow: -4px 0 40px rgba(0,0,0,0.04);
          background: var(--xp-bg);
        }

        /* ═══════════ DARK MODE ═══════════ */
        .dark .xp-root {
          --xp-bg: #0a0a0f;
          --xp-left-bg: #111118;
          --xp-left-border: #1e1e2a;
          --xp-right-bg: #0f0f16;
          --xp-text: #f0f0f5;
          --xp-text-secondary: #c8c8d0;
          --xp-text-muted: #8888a0;
          --xp-text-faint: #5a5a70;
          --xp-card-bg: #18181f;
          --xp-card-border: rgba(255,255,255,0.06);
          --xp-card-shadow: 0 2px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2);
          --xp-card-hover-shadow: 0 8px 30px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.25);
          --xp-input-bg: #1a1a24;
          --xp-input-border: #2a2a38;
          --xp-input-focus-bg: #1c1810;
          --xp-badge-bg: rgba(79,70,229,0.12);
          --xp-badge-border: rgba(79,70,229,0.25);
          --xp-feat-bg: #18181f;
          --xp-stat-bg: #18181f;
          --xp-ai-card-bg: rgba(79,70,229,0.08);
          --xp-ai-card-border: rgba(79,70,229,0.2);
          --xp-dropdown-bg: #22222e;
          --xp-right-shadow: -4px 0 40px rgba(0,0,0,0.3);
          background: var(--xp-bg);
        }

        /* ═══ LEFT PANEL ═══ */
        .xp-left {
          flex:1; background:var(--xp-left-bg); padding:32px 40px; overflow-y:auto;
          animation: fadeIn .6s ease both;
          border-right: 1px solid var(--xp-left-border);
          position:relative;
        }

        /* ═══ RIGHT PANEL ═══ */
        .xp-right {
          width:440px; min-width:440px; background:var(--xp-right-bg);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:48px 48px; position:relative;
          box-shadow: var(--xp-right-shadow);
        }

        /* Card */
        .xp-card {
          background:var(--xp-card-bg); border-radius:16px; padding:16px 18px;
          box-shadow:var(--xp-card-shadow);
          border:1px solid var(--xp-card-border);
          transition: transform .2s, box-shadow .2s;
        }
        .xp-card:hover {
          transform:translateY(-2px);
          box-shadow:var(--xp-card-hover-shadow);
        }

        /* Form inputs */
        .xp-field { margin-bottom:18px; }
        .xp-label { display:block; font-size:15px; font-weight:600; color:var(--xp-text-secondary); margin-bottom:8px; }
        .xp-iw {
          display:flex; align-items:center;
          border:1.5px solid var(--xp-input-border); border-radius:12px;
          background:var(--xp-input-bg); transition:all .25s ease; overflow:hidden;
        }
        .xp-iw:focus-within {
          border-color:#F97316; background:var(--xp-input-focus-bg);
          box-shadow:0 0 0 4px rgba(79,70,229,.12);
        }
        .xp-ii { padding:0 14px; color:var(--xp-text-faint); display:flex; align-items:center; flex-shrink:0; }
        .xp-inp {
          flex:1; padding:14px 0; border:none; outline:none; background:transparent;
          font-size:16px; color:var(--xp-text); font-family:inherit;
        }
        .xp-inp::placeholder { color:var(--xp-text-faint); }
        .xp-inp:-webkit-autofill,
        .xp-inp:-webkit-autofill:hover, 
        .xp-inp:-webkit-autofill:focus, 
        .xp-inp:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px var(--xp-input-bg) inset !important;
            -webkit-text-fill-color: var(--xp-text) !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        .xp-eye {
          padding:0 14px; background:none; border:none; cursor:pointer;
          color:var(--xp-text-faint); display:flex; align-items:center; transition:color .2s;
        }
        .xp-eye:hover { color:#F97316; }

        .xp-btn {
          width:100%; padding:16px; background:#F97316; color:#fff;
          font-size:17px; font-weight:700; border:none; border-radius:12px; cursor:pointer;
          box-shadow:0 4px 16px rgba(79,70,229,.35); transition:all .25s ease; font-family:inherit;
          letter-spacing:0.3px;
        }
        .xp-btn:hover {
          background:#EA580C; transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(79,70,229,.4);
        }
        .xp-btn:active { transform:translateY(0); }
        .xp-btn:disabled { opacity:.7; cursor:not-allowed; transform:none; }
        .xp-spinner {
          display:inline-block; width:16px; height:16px;
          border:2.5px solid rgba(255,255,255,.35); border-top-color:#fff;
          border-radius:50%; animation:spin .6s linear infinite;
          vertical-align:middle; margin-right:8px;
        }

        .xp-google {
          width:100%; display:flex; align-items:center; justify-content:center; gap:12px;
          padding:14px; background:var(--xp-card-bg); border:1.5px solid var(--xp-input-border); border-radius:12px;
          font-size:16px; font-weight:600; color:var(--xp-text); cursor:pointer;
          transition:all .25s ease; font-family:inherit;
        }
        .xp-google:hover {
          border-color:var(--xp-text-faint); box-shadow:0 4px 16px rgba(0,0,0,0.08);
          transform:translateY(-1px);
        }

        .xp-divider { display:flex; align-items:center; gap:14px; margin:20px 0; }
        .xp-divider::before, .xp-divider::after { content:''; flex:1; height:1px; background:var(--xp-input-border); }
        .xp-divider span { font-size:14px; color:var(--xp-text-faint); font-weight:500; }

        .xp-error {
          display:flex; align-items:center; gap:8px; background:#FEF2F2;
          border:1.5px solid #FECACA; color:#DC2626; font-size:14px;
          padding:12px 14px; border-radius:10px; margin-bottom:16px;
          animation:fadeUp .3s ease both;
        }
        .dark .xp-error {
          background:rgba(220,38,38,0.1); border-color:rgba(220,38,38,0.2);
        }

        /* Feature icon box */
        .xp-feat {
          display:flex; flex-direction:column; align-items:center; text-align:center;
          padding:16px 10px; border-radius:14px; background:var(--xp-feat-bg);
          border:1px solid var(--xp-card-border);
          box-shadow:0 1px 6px rgba(0,0,0,0.04);
          transition: transform .2s, box-shadow .2s;
          cursor:default;
        }
        .xp-feat:hover {
          transform:translateY(-3px);
          box-shadow:0 6px 20px rgba(0,0,0,0.08);
        }

        /* Stat box */
        .xp-stat {
          display:flex; align-items:center; gap:10px; padding:14px 16px;
          background:var(--xp-stat-bg); border-radius:14px; border:1px solid var(--xp-card-border);
          box-shadow:0 1px 6px rgba(0,0,0,0.04);
          transition: transform .2s;
        }
        .xp-stat:hover { transform:translateY(-2px); }

        /* Responsive */
        @media(max-width:1024px) {
          .xp-left { padding:24px 28px; }
        }
        @media(max-width:900px) {
          .xp-left { display:none; }
          .xp-right { width:100%; min-width:unset; }
        }
        @media(max-width:480px) {
          .xp-right { padding:36px 20px; }
        }
      `}</style>

      <div className="xp-root">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="xp-left">

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:30, animation:'slideRight .5s ease both' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.5 8H20L14.5 12L16.5 18L12 14.5L7.5 18L9.5 12L4 8H10.5L12 2Z" fill="#F97316" stroke="#F97316" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize:26, fontWeight:800, color:'var(--xp-text)', letterSpacing:'-0.5px' }}>Xeno</span>
          </div>

          {/* Badge */}
          <div style={{ marginBottom:22, animation:'fadeUp .5s ease both .1s' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:7, background:'var(--xp-badge-bg)', border:'1px solid var(--xp-badge-border)', color:'#C2410C', fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:20, letterSpacing:'0.8px', textTransform:'uppercase' }}>
              🤖 AI-NATIVE MINI CRM
            </span>
          </div>

          {/* Hero section */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:28, alignItems:'flex-start', marginBottom:32, position:'relative' }}>

            {/* Left: headline + description */}
            <div style={{ animation:'fadeUp .6s ease both .15s' }}>
              <h1 style={{ fontSize:'clamp(32px, 3.2vw, 44px)', fontWeight:900, color:'var(--xp-text)', lineHeight:1.15, letterSpacing:'-1.2px', marginBottom:18 }}>
                The AI-Native CRM<br/>
                for Smarter Customer<br/>
                <span style={{ color:'#F97316' }}>Engagement.</span>
              </h1>
              <p style={{ fontSize:16, color:'var(--xp-text-muted)', lineHeight:1.7, maxWidth:400 }}>
                Xeno helps consumer brands understand their customers, build the right audiences, and run personalized campaigns across every channel – all powered by AI.
              </p>
            </div>

            {/* Right: floating avatars + Campaign Performance card */}
            <div style={{ animation:'fadeUp .6s ease both .25s', position:'relative', minWidth:240 }}>
              {/* Floating avatar top */}
              <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#F97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'3px solid var(--xp-card-bg)', boxShadow:'0 4px 14px rgba(0,0,0,0.12)', animation:'float 3s ease-in-out infinite', position:'absolute', top:-10, left:-22, zIndex:2 }}>
                👩
              </div>

              {/* Campaign Performance Card */}
              <div className="xp-card" style={{ padding:'18px 20px', marginTop:24 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--xp-text)' }}>Campaign Performance</span>
                  <span style={{ fontSize:12, color:'var(--xp-text-muted)', background:'var(--xp-dropdown-bg)', padding:'4px 10px', borderRadius:6 }}>This Month ▾</span>
                </div>

                {/* Stats row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                  {[
                    { label:'Sent', value:'128K', color:'var(--xp-text)' },
                    { label:'Delivered', value:'98.5%', color:'#22C55E' },
                    { label:'Opened', value:'42.3%', color:'#3B82F6' },
                    { label:'Clicked', value:'18.7%', color:'#F97316' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'var(--xp-text-faint)', marginBottom:3 }}>{s.label}</div>
                      <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                <LineChart />
              </div>

              {/* Second floating avatar */}
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#FB923C,#EA580C)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'3px solid var(--xp-card-bg)', boxShadow:'0 4px 14px rgba(0,0,0,0.12)', animation:'float 3.5s ease-in-out infinite .5s', position:'absolute', bottom:-12, right:-14, zIndex:2 }}>
                🧔
              </div>
            </div>
          </div>

          {/* Feature icons row (No cards) */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, animation:'fadeUp .6s ease both .3s', marginBottom:32 }}>
            {[
              { icon: <svg width="24" height="24" fill="none" stroke="#F97316" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, label:'Understand Customers', sub:'Unify customer data from orders and behavior.' },
              { icon: <svg width="24" height="24" fill="none" stroke="#3B82F6" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>, label:'AI-Powered Segments', sub:'Let AI find high-impact audiences in seconds.' },
              { icon: <svg width="24" height="24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>, label:'Personalized Campaigns', sub:'Deliver the right message on the right channel.' },
              { icon: <svg width="24" height="24" fill="none" stroke="#22C55E" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, label:'Measure & Grow', sub:'Track performance in real time and maximize ROI.' },
            ].map(f => (
              <div key={f.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:8 }}>
                <div style={{ flexShrink:0, marginTop:2 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--xp-text)', marginBottom:4 }}>{f.label}</div>
                  <div style={{ fontSize:12, color:'var(--xp-text-muted)', lineHeight:1.5 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Built for modern brands */}
          <div className="xp-card" style={{ marginBottom:18, animation:'fadeUp .6s ease both .35s' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--xp-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:16 }}>Built for modern brands</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {[
                { icon:'👥', color:'#F97316', bg:'#EEF2FF', value:'10M+', label:'Shoppers engaged' },
                { icon:'📨', color:'#3B82F6', bg:'#EFF6FF', value:'2.5B+', label:'Messages sent' },
                { icon:'✅', color:'#22C55E', bg:'#F0FDF4', value:'98%', label:'Delivery rate' },
                { icon:'💰', color:'#8B5CF6', bg:'#FFFBEB', value:'45%', label:'Avg. revenue uplift' },
              ].map(s => (
                <div key={s.label} className="xp-stat" style={{ flexDirection:'column', alignItems:'center', textAlign:'center', gap:8, padding:'16px 10px' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:'var(--xp-text)' }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'var(--xp-text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI that works for you */}
          <div className="xp-card" style={{ animation:'fadeUp .6s ease both .4s' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'flex-start' }}>

              {/* Left: description + bullet points */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#F97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🤖</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--xp-text)' }}>AI that works for you</div>
                    <div style={{ fontSize:12, color:'var(--xp-text-muted)' }}>From audience discovery to message creation</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'var(--xp-text-muted)', lineHeight:1.6, marginBottom:12 }}>
                  Xeno's AI helps you make smarter decisions, faster and with greater impact.
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                  {[
                    'Predict high-value customers',
                    'Recommend the best channel',
                    'Generate personalized messages',
                    'Optimize send time for better results',
                  ].map(item => (
                    <li key={item} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--xp-text-secondary)', marginBottom:7 }}>
                      <span style={{ color:'#F97316', fontSize:14, fontWeight:700 }}>●</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: AI Suggested Message card */}
              <div>
                <div style={{ background:'var(--xp-ai-card-bg)', border:'1px solid var(--xp-ai-card-border)', borderRadius:14, padding:'16px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12 }}>
                    <span style={{ fontSize:14 }}>✨</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#C2410C' }}>AI Suggested Message</span>
                  </div>
                  <div style={{ fontSize:14, color:'var(--xp-text-secondary)', lineHeight:1.6, marginBottom:12 }}>
                    <span style={{ fontWeight:700 }}>Hi Sarah!</span><br/>
                    Enjoy 20% off our new collection, just for you.
                  </div>
                  <button style={{ fontSize:13, fontWeight:700, color:'#F97316', background:'none', border:'1.5px solid #F97316', borderRadius:8, padding:'8px 16px', cursor:'pointer', transition:'all .2s', fontFamily:'inherit' }}
                    onMouseEnter={e=>{e.target.style.background='#F97316';e.target.style.color='#fff'}}
                    onMouseLeave={e=>{e.target.style.background='none';e.target.style.color='#F97316'}}>
                    Use This Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="xp-right">

          <div style={{ position:'absolute', top:22, right:26, display:'flex', gap:8, alignItems:'center' }}>
              <button 
                onClick={() => {
                  if (installPrompt) handleInstall();
                  else alert('PWA Install is not available right now. This usually means the app is already installed or your browser is blocking it.');
                }} 
                title="Install App" 
                style={{ height:38, padding: '0 16px', borderRadius:20, border:'2px solid #F97316', background:'var(--xp-card-bg)', display:'flex', alignItems:'center', gap: 6, cursor:'pointer', color:'#F97316', fontWeight: 700, fontSize: 13, transition:'all .2s', boxShadow: '0 2px 10px rgba(79,70,229,0.2)' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Install App
              </button>
            <button onClick={() => setIsDark(false)} title="Light mode" style={{ width:38, height:38, borderRadius:'50%', border:'1.5px solid', borderColor: !isDark?'#F97316':'var(--xp-input-border)', background: !isDark?'var(--xp-badge-bg)':'var(--xp-card-bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#F97316', transition:'all .2s' }}>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1M4.22 4.22l.71.71m12.73 12.73l.71.71M3 12H2m20 0h-1M4.93 19.07l-.71-.71M19.78 4.93l-.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </button>
            <button onClick={() => setIsDark(true)} title="Dark mode" style={{ width:38, height:38, borderRadius:'50%', border:'1.5px solid', borderColor: isDark?'#FB923C':'var(--xp-input-border)', background: isDark?'rgba(99,102,241,0.1)':'var(--xp-card-bg)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#FB923C', transition:'all .2s' }}>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </button>
          </div>

          <div style={{ width:'100%', maxWidth:360, animation:'fadeUp .6s ease both .15s' }}>

            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 6, display: 'inline-flex', boxShadow: '0 8px 24px rgba(79,70,229,0.4)', border: '2px solid rgba(79,70,229,0.3)' }}>
                  <img src="/pwa-192x192.svg" alt="Xeno Logo" style={{ width: 64, height: 64 }} />
                </div>
              </div>
              <h2 style={{ fontSize:32, fontWeight:800, color:'var(--xp-text)', letterSpacing:'-0.5px', marginBottom:10 }}>Join <span style={{ color:'#F97316' }}>Xeno</span></h2>
              <p style={{ fontSize:16, color:'var(--xp-text-faint)' }}>Create an account to continue</p>
            </div>

            {error && (
              <div className="xp-error">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="xp-field">
                <label className="xp-label" htmlFor="xp-name">Full Name</label>
                <div className="xp-iw">
                  <span className="xp-ii"><IconUser/></span>
                  <input id="xp-name" type="text" name="name" className="xp-inp" value={form.name} onChange={handleChange} placeholder="Enter your full name" required autoComplete="name"/>
                </div>
              </div>

              <div className="xp-field">
                <label className="xp-label" htmlFor="xp-email">Email address</label>
                <div className="xp-iw">
                  <span className="xp-ii"><IconMail/></span>
                  <input id="xp-email" type="email" name="email" className="xp-inp" value={form.email} onChange={handleChange} placeholder="Enter your email" required autoComplete="email"/>
                </div>
              </div>

              <div className="xp-field" style={{ marginBottom: 28 }}>
                <label className="xp-label" htmlFor="xp-pwd">Password</label>
                <div className="xp-iw">
                  <span className="xp-ii"><IconLock/></span>
                  <input id="xp-pwd" type={showPwd?'text':'password'} name="password" className="xp-inp" value={form.password} onChange={handleChange} placeholder="Create a password" required autoComplete="new-password"/>
                  <button type="button" className="xp-eye" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>{showPwd?<IconEyeOff/>:<IconEyeOn/>}</button>
                </div>
              </div>

              <button type="submit" className="xp-btn" disabled={loading}>
                {loading ? <><span className="xp-spinner"/>Creating account…</> : 'Register'}
              </button>
            </form>

            <div className="xp-divider"><span>OR</span></div>

            <button className="xp-google" onClick={() => window.location.href='https://crm-native-ai-1.onrender.com/api/auth/google'}>
              <GoogleIcon/> Continue with Google
            </button>

            <p style={{ textAlign:'center', marginTop:28, fontSize:16, color:'var(--xp-text-faint)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#F97316', fontWeight:700, textDecoration:'none', transition:'opacity .2s' }}
                onMouseEnter={e=>e.target.style.opacity='0.8'} onMouseLeave={e=>e.target.style.opacity='1'}>
                Sign in →
              </Link>
            </p>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:24 }}>
              <svg width="15" height="15" fill="none" stroke="var(--xp-text-faint)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize:13, color:'var(--xp-text-faint)' }}>Your data is secure with industry-standard encryption</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
