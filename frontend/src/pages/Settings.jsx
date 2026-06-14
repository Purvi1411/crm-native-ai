import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const IconSettings = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
    background: value ? '#4F46E5' : '#E5E7EB', position: 'relative', transition: 'background .2s', flexShrink: 0
  }}>
    <span style={{
      position: 'absolute', top: 3, left: value ? 22 : 3, width: 18, height: 18,
      borderRadius: '50%', background: 'var(--bg-card)', transition: 'left .2s',
      boxShadow: '0 1px 4px rgba(0,0,0,.2)'
    }} />
  </button>
);

const Section = ({ title, children }) => (
  <div className="xn-card" style={{ marginBottom: 16 }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  </div>
);

const SettingRow = ({ label, desc, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-ghost)' }}>{label}</p>
      {desc && <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>}
    </div>
    {children}
  </div>
);

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedData = localStorage.getItem('xeno_settings');
    if (savedData) {
      try { return JSON.parse(savedData); } catch(e) {}
    }
    return {
    // Profile
    name: 'Admin', email: 'admin@xenoreach.ai', role: 'CRM Manager', company: 'TechMahindra',
    // Notifications
    emailNotifs: true, smsNotifs: false, campaignAlerts: true, churnAlerts: true, weeklyReport: true,
    // AI
    autoSuggest: true, brandSafety: true, aiModel: 'llama-3.1-8b-instant', temperature: '0.5',
    // Channels
    whatsappEnabled: true, emailEnabled: true, smsEnabled: true, rcsEnabled: false,
    // Delivery
    retryAttempts: '3', retryDelay: '5', failureThreshold: '20',
    };
  });


  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('xeno_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="xn-app-layout">
      <Sidebar />
      <main className="xn-page-content">
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconSettings /> Settings
            </h1>
            <p className="xn-page-sub">Configure your XenoReach CRM workspace</p>
          </div>
          <button className="xn-btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>
          <div>
            {/* Profile */}
            <Section title="👤 Profile">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Full Name', key: 'name' },
                  { label: 'Email',     key: 'email' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 5 }}>{f.label}</label>
                    <input type="text" value={settings[f.key]} onChange={e => set(f.key, e.target.value)} className="xn-input" style={{ width: '100%' }} />
                  </div>
                ))}
              </div>
            </Section>

            {/* AI Configuration */}
            <Section title="🤖 AI Configuration">
              <SettingRow label="Auto-Suggest Campaigns" desc="AI proactively suggests campaigns based on data">
                <Toggle value={settings.autoSuggest} onChange={val => set('autoSuggest', val)} />
              </SettingRow>
              <SettingRow label="Brand Safety Filter" desc="Reject copy with spammy or unsafe language">
                <Toggle value={settings.brandSafety} onChange={val => set('brandSafety', val)} />
              </SettingRow>
              <SettingRow label="AI Model">
                <select value={settings.aiModel} onChange={e => set('aiModel', e.target.value)} className="xn-input" style={{ width: 200 }}>
                  <option value="llama-3.1-8b-instant">LLaMA 3.1 8B (Fast)</option>
                  <option value="llama-3.1-70b-versatile">LLaMA 3.1 70B (Powerful)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                </select>
              </SettingRow>
              <SettingRow label="AI Temperature" desc="Higher = more creative, Lower = more precise">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={e => set('temperature', e.target.value)} style={{ width: 100, accentColor: '#4F46E5' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', width: 28, textAlign: 'right' }}>{settings.temperature}</span>
                </div>
              </SettingRow>
            </Section>
          </div>

          {/* Right column */}
          <div>
            {/* Channels */}
            <Section title="📢 Channel Toggles">
              {[
                { key: 'whatsappEnabled', label: 'WhatsApp', color: '#22C55E', icon: '💬' },
                { key: 'emailEnabled',    label: 'Email',     color: '#3B82F6', icon: '📧' },
                { key: 'smsEnabled',      label: 'SMS',       color: '#4F46E5', icon: '📱' },
                { key: 'rcsEnabled',      label: 'RCS',       color: '#8B5CF6', icon: '📡' },
              ].map(ch => (
                <SettingRow key={ch.key} label={`${ch.icon} ${ch.label}`}>
                  <Toggle value={settings[ch.key]} onChange={val => set(ch.key, val)} />
                </SettingRow>
              ))}
            </Section>


            {/* About */}
            <div className="xn-card" style={{ background: '#0F0F0F', border: '1px solid rgba(79,70,229,.15)' }}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⭐</div>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--bg-card)' }}>XenoReach AI</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>v2.0.0 · Production</p>
                <div style={{ marginTop: 14, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  {[['Backend', '#22C55E', 'Connected'], ['AI Engine', '#A78BFA', 'Groq Cloud'], ['Database', '#3B82F6', 'MongoDB']].map(([label, color, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, padding: '0 4px' }}>
                      <span style={{ color: 'rgba(255,255,255,.4)' }}>{label}</span>
                      <span style={{ color, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="xn-card" style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.15)', marginTop: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>These actions are irreversible. Please proceed with caution.</p>
              <button style={{ width: '100%', padding: '9px', background: 'none', border: '1.5px solid #EF4444', borderRadius: 9, color: '#EF4444', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                onClick={() => window.confirm('Are you sure? This will clear all campaign data.') && alert('Demo: Data cleared.')}>
                Clear All Campaign Data
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
