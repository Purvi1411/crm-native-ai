import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const IconLightbulb = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.69-1.52 5.03-3.75 6.25L15 17H9l-.25-1.75C6.52 14.03 5 11.69 5 9a7 7 0 017-7z"/></svg>;
const IconRocket    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>;
const IconRefresh   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;

const TYPE_STYLES = {
  urgent:    { bg: 'var(--bg-card)', border: 'rgba(239,68,68,0.2)', badge: 'rgba(220,38,38,.1)', badgeText: '#EF4444', icon: '🚨' },
  growth:    { bg: 'var(--bg-card)', border: 'rgba(34,197,94,0.2)', badge: 'rgba(22,163,74,.1)', badgeText: '#22C55E', icon: '📈' },
  retention: { bg: 'var(--bg-card)', border: 'rgba(59,130,246,0.2)', badge: 'rgba(37,99,235,.1)', badgeText: '#3B82F6', icon: '🔄' },
};

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launched, setLaunched] = useState({});
  const navigate = useNavigate();

  const fetchRecs = () => {
    setLoading(true);
    axios.get('https://crm-native-ai-1.onrender.com/api/realtime/recommendations')
      .then(r => setRecs(r.data.recommendations || []))
      .catch(() => setRecs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchRecs(); 
    
    // Listen for live events so recommendations update immediately after a campaign launches
    const es = new EventSource('https://crm-native-ai-1.onrender.com/api/realtime/events');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'queued' || data.type === 'completed') {
          fetchRecs(); // Pull fresh recommendations!
        }
      } catch (_) {}
    };
    return () => es.close();
  }, []);

  const handleLaunch = (rec) => {
    setLaunched(prev => ({ ...prev, [rec.id]: true }));
    const title = rec.title || rec.name || 'AI Audience';
    setTimeout(() => navigate('/agent', { state: { prefillAudience: title } }), 600);
  };

  const urgentCount = recs.filter(r => r.type === 'urgent').length;
  const growthCount = recs.filter(r => r.type === 'growth').length;
  const retentionCount = recs.filter(r => r.type === 'retention').length;

  return (
    <div className="xn-app-layout">
      <Sidebar />
      <main className="xn-page-content">
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#FCD34D' }}><IconLightbulb /></span> Smart Recommendations
            </h1>
            <p className="xn-page-sub">AI-generated campaign suggestions based on your customer data</p>
          </div>
          <button className="xn-btn-ghost" onClick={fetchRecs} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IconRefresh /> Refresh
          </button>
        </div>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Urgent',    count: urgentCount,    color: '#DC2626', bg: 'rgba(220,38,38,.07)',  desc: 'Immediate action needed' },
            { label: 'Growth',    count: growthCount,    color: '#16A34A', bg: 'rgba(22,163,74,.07)',  desc: 'Revenue opportunities'    },
            { label: 'Retention', count: retentionCount, color: '#2563EB', bg: 'rgba(37,99,235,.07)',  desc: 'Loyalty improvements'     },
          ].map(s => (
            <div key={s.label} className="xn-metric-card" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
              <div className="xn-metric-label">{s.label} Actions</div>
              <div className="xn-metric-value" style={{ color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Recommendation cards */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <span style={{ width: 16, height: 16, border: '2.5px solid #E5E7EB', borderTopColor: '#06B6D4', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
            Generating AI recommendations…
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {recs.map((rec, i) => {
              const t = TYPE_STYLES[rec.type] || TYPE_STYLES.retention;
              const isLaunched = launched[rec.id];
              return (
                <div key={rec.id} className="xn-fade-up" style={{
                  animationDelay: `${i * 60}ms`,
                  background: t.bg, border: `1.5px solid ${t.border}`,
                  borderRadius: 14, padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: 10
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{rec.title || rec.name || 'AI Recommendation'}</h3>
                    </div>
                    <span style={{ background: t.badge, color: t.badgeText, fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>
                      {rec.type || 'growth'}
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '10px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Recommended Action</p>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)' }}>{rec.action || rec.description || rec.strategy || 'Optimize engagement'}</p>
                  </div>

                  {/* Impact */}
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>📊 {rec.impact || 'Predicted lift in core metrics'}</p>

                  {/* Launch button */}
                  <button
                    onClick={() => handleLaunch(rec)}
                    disabled={isLaunched}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '9px', borderRadius: 9, fontSize: 12.5, fontWeight: 700,
                      border: 'none', cursor: isLaunched ? 'default' : 'pointer',
                      background: isLaunched ? '#22C55E' : '#06B6D4',
                      color: 'var(--bg-card)', transition: 'all .2s', fontFamily: 'Inter, sans-serif',
                      boxShadow: isLaunched ? 'none' : '0 4px 12px rgba(79,70,229,.3)'
                    }}
                  >
                    {isLaunched ? '✓ Launching Campaign…' : (<><IconRocket /> Launch Campaign</>)}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
