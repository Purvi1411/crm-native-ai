import { Link, useLocation } from 'react-router-dom';

/* ── SVG Icons ── */
const XenoLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.5 8H20L14.5 12L16.5 18L12 14.5L7.5 18L9.5 12L4 8H10.5L12 2Z"
      fill="#4F46E5" stroke="#4F46E5" strokeWidth="0.5" strokeLinejoin="round"/>
  </svg>
);

const icons = {
  dashboard:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  users:        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  target:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  zap:          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  megaphone:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  radio:        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/></svg>,
  barchart:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  alerttri:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  brain:        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v0a2 2 0 002 2h.5A2.5 2.5 0 017 13.5v0A2.5 2.5 0 019.5 16H10"/><path d="M14.5 2A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0119.5 7H20a2 2 0 012 2v0a2 2 0 01-2 2h-.5A2.5 2.5 0 0117 13.5v0A2.5 2.5 0 0114.5 16H14"/><path d="M12 16v6M9 22h6"/><circle cx="12" cy="12" r="3"/></svg>,
  lightbulb:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.69-1.52 5.03-3.75 6.25L15 17H9l-.25-1.75C6.52 14.03 5 11.69 5 9a7 7 0 017-7z"/></svg>,
  settings:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  sun:          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1M4.22 4.22l.71.71m12.73 12.73l.71.71M3 12H2m20 0h-1M4.93 19.07l-.71-.71M19.78 4.93l-.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  moon:         <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  calendar:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

const NAV = [
  {
    section: 'CORE',
    items: [
      { to: '/dashboard', label: 'Dashboard',   icon: 'dashboard' },
      { to: '/customers', label: 'Customers',   icon: 'users'     },
      { to: '/segments',  label: 'Segments',    icon: 'target'    },
    ],
  },
  {
    section: 'GROWTH',
    items: [
      { to: '/agent',     label: 'AI Campaign Agent', icon: 'zap',       accent: '#4F46E5' },
      { to: '/calendar',  label: 'Occasions Calendar', icon: 'calendar', accent: '#EC4899' },
      { to: '/campaigns', label: 'Campaigns',         icon: 'megaphone'  },
      { to: '/monitor',   label: 'Live Monitor',      icon: 'radio',     accent: '#22C55E', dot: true },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { to: '/analytics',  label: 'Analytics',          icon: 'barchart'  },
      { to: '/churn',      label: 'Churn Intelligence',  icon: 'alerttri', accent: '#EF4444' },
      { to: '/copilot',    label: 'AI Copilot',          icon: 'brain',    accent: '#A78BFA' },
      { to: '/recommendations', label: 'Recommendations', icon: 'lightbulb', accent: '#FCD34D' },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { to: '/settings',  label: 'Settings',   icon: 'settings'  },
    ],
  },
];

import { useState, useEffect } from 'react';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
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
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Close sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
        .xn-sidebar {
          width: 240px; min-width: 240px;
          background: var(--bg-sidebar);
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
          border-right: 1px solid var(--border-sidebar);
          overflow: hidden;
          transition: background 0.2s, border-color 0.2s, transform 0.3s ease;
        }
        .xn-sb-logo {
          display: flex; align-items: center; gap: 9px;
          padding: 22px 18px 18px;
          font-size: 17px; font-weight: 800; color: var(--text-sidebar-main); letter-spacing: -.4px;
          border-bottom: 1px solid var(--border-sidebar);
          flex-shrink: 0;
        }
        .xn-sb-logo span { color: #4F46E5; }
        .xn-sb-scroll { flex: 1; overflow-y: auto; padding-bottom: 8px; }
        .xn-sb-scroll::-webkit-scrollbar { width: 3px; }
        .xn-sb-scroll::-webkit-scrollbar-thumb { background: var(--bg-sidebar-hover); border-radius: 4px; }
        .xn-sb-section {
          font-size: 9px; font-weight: 700; letter-spacing: 1.4px;
          color: var(--text-sidebar-ghost); padding: 16px 18px 5px;
          text-transform: uppercase;
        }
        .xn-sb-link {
          display: flex; align-items: center; gap: 9px;
          margin: 1px 8px; padding: 8px 11px; border-radius: 8px;
          font-size: 12.5px; font-weight: 500;
          color: var(--text-sidebar-muted);
          text-decoration: none; transition: all .15s;
          cursor: pointer; border: none; background: transparent;
          width: calc(100% - 16px); text-align: left;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          position: relative;
        }
        .xn-sb-link:hover { color: var(--text-sidebar-main); background: var(--bg-sidebar-hover); }
        .xn-sb-link.active {
          color: var(--text-sidebar-main); font-weight: 600;
          background: linear-gradient(135deg, rgba(79,70,229,.15), rgba(79,70,229,.05));
          border: 1px solid rgba(79,70,229,.28);
        }
        .xn-sb-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22C55E;
          margin-left: auto; flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(34,197,94,.2);
          animation: sbPulse 2s infinite;
        }
        @keyframes sbPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .xn-sb-footer {
          flex-shrink: 0; padding: 12px 8px 12px;
          border-top: 1px solid var(--border-sidebar);
        }
        .xn-sb-user {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 11px; border-radius: 8px; margin-bottom: 3px;
        }
        .xn-sb-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg,#4F46E5,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }
        .xn-sb-uname { font-size: 12px; font-weight: 600; color: var(--text-sidebar-main); }
        .xn-sb-urole { font-size: 10px; color: var(--text-sidebar-muted); }
      `}</style>

      <button className="mobile-toggle-btn" onClick={() => setMobileOpen(true)}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`xn-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="xn-sb-logo">
          <XenoLogo /> Xeno<span>Reach</span>
        </div>

        {/* Scrollable nav */}
        <div className="xn-sb-scroll">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="xn-sb-section">{section}</div>
              {items.map(({ to, label, icon, accent, dot }) => {
                const isActive = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`xn-sb-link ${isActive ? 'active' : ''}`}
                    style={isActive && accent ? { borderColor: `${accent}44`, background: `${accent}18` } : {}}
                  >
                    <span style={{ color: isActive ? (accent || '#4F46E5') : 'inherit', display: 'flex' }}>
                      {icons[icon]}
                    </span>
                    {label}
                    {dot && <span className="xn-sb-dot" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="xn-sb-footer">
          <div className="xn-sb-user">
            <div className="xn-sb-avatar">👤</div>
            <div>
              <div className="xn-sb-uname">Admin</div>
              <div className="xn-sb-urole">CRM Manager</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button 
              className="xn-sb-link" 
              style={{ width: '100%', padding: '10px 11px', display: 'flex', alignItems: 'center', gap: 9 }} 
              onClick={() => setIsDark(!isDark)} 
              title="Toggle Dark Mode"
            >
              <span style={{ display: 'flex' }}>{isDark ? icons.sun : icons.moon}</span>
              <span style={{ fontWeight: 600 }}>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
            <button className="xn-sb-link" style={{ width: '100%' }} onClick={handleLogout}>
              <span style={{ display: 'flex' }}>{icons.logout}</span> Logout
            </button>

            {/* PWA Install Button */}
            {showInstall && (
              <button
                onClick={handleInstall}
                style={{
                  width: '100%', margin: '4px 0 0', padding: '9px 11px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, rgba(79,70,229,.18), rgba(79,70,229,.08))',
                  border: '1.5px solid rgba(79,70,229,.35)', borderRadius: 8,
                  color: '#4F46E5', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16 }}>📲</span> Install App
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
