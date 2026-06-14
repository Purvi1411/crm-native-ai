import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

/* ── tiny icons ── */
const IconActivity    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconShieldCheck = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IconAlert       = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconRefresh     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
const IconTerminal    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
const IconZap         = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconSparkles    = () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l1.5 6H20l-5.5 4 2 6L12 14.5 7.5 18l2-6L4 8h6.5L12 2z"/></svg>;
const IconRocket      = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>;
const IconUser        = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const MetricCard = ({ label, value, color, icon, tag, index, onRefresh }) => (
  <div className="xn-metric-card" style={{ animation: `fadeUp .4s ${index * 0.1}s ease both` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span className="xn-metric-label">{label}</span>
      {tag && <span style={{ fontSize: '9px', fontWeight: 700, background: `${color}15`, color: color, padding: '3px 8px', borderRadius: 20, letterSpacing: '.4px', textTransform: 'uppercase' }}>{tag}</span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <span className="xn-metric-value" style={{ color }}>{value}</span>
      <span 
        style={{ marginBottom: 4, color, cursor: onRefresh ? 'pointer' : 'default' }} 
        onClick={onRefresh}
        title={onRefresh ? "Refresh stats" : undefined}
      >
        {icon}
      </span>
    </div>
  </div>
);

// Animated Tooltip for charts
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--text-main)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(249,115,22,.3)', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
      <p style={{ color: 'var(--bg-card)', fontWeight: 700, marginBottom: 2 }}>{payload[0].payload.time}</p>
      <p style={{ color: '#22C55E' }}>Delivered: {payload[0].value}</p>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveFeed, setLiveFeed] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeRecIndex, setActiveRecIndex] = useState(0);
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);
  const feedRef = useRef([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      if (urlEmail) {
        localStorage.setItem('userEmail', urlEmail);
        setUserEmail(urlEmail);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('token');
    if (token) {
      axios.get('https://crm-native-ai-1.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
         if (res.data && res.data.email) {
           localStorage.setItem('userEmail', res.data.email);
           setUserEmail(res.data.email);
         }
         if (res.data && res.data._id) {
           localStorage.setItem('userId', res.data._id);
         }
      }).catch(err => {
          console.log('Failed to fetch user', err);
          if (err.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('userEmail');
              setUserEmail('');
          }
      });
    }
  }, []);

  const loadDashboardData = () => {
    axios.get('https://crm-native-ai-1.onrender.com/api/realtime/stats')
      .then(res => {
        setStats(res.data);
        
        // Generate dynamic chart data based on recent campaigns to look active
        const baseChart = res.data.recentCampaigns.slice(0, 10).reverse().map(c => ({
          time: new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          delivered: c.stats.delivered || 0
        }));
        
        setChartData(baseChart);
        setLoading(false);
      })
      .catch(() => setLoading(false));
      
    axios.get('https://crm-native-ai-1.onrender.com/api/realtime/recommendations')
      .then(res => setRecommendations(res.data.recommendations))
      .catch(() => {});
  };

  useEffect(() => {
    loadDashboardData();

    axios.get('https://crm-native-ai-1.onrender.com/api/realtime/monitor-feed')
      .then(res => {
        const events = res.data.events || [];
        feedRef.current = events;
        setLiveFeed(events.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  // Dynamic recommendation & spotlight rotator
  useEffect(() => {
    if (recommendations.length > 0) {
      const recInterval = setInterval(() => setActiveRecIndex(prev => (prev + 1) % recommendations.length), 5500);
      return () => clearInterval(recInterval);
    }
  }, [recommendations]);

  useEffect(() => {
    if (stats && stats.topAtRiskCustomers?.length > 0) {
      const spotInterval = setInterval(() => setActiveSpotlightIndex(prev => (prev + 1) % stats.topAtRiskCustomers.length), 4000);
      return () => clearInterval(spotInterval);
    }
  }, [stats]);

  useEffect(() => {
    const insightInterval = setInterval(() => setActiveInsightIndex(prev => (prev + 1) % 3), 6000);
    return () => clearInterval(insightInterval);
  }, []);

  // Real-time updates via SSE
  useEffect(() => {
    const es = new EventSource('https://crm-native-ai-1.onrender.com/api/realtime/events');
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') return;

        const newEvent = {
          id: data.id || `${data.type}-${Date.now()}`,
          time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          text: data.text || data.message || '',
          type: data.type
        };

        feedRef.current = [newEvent, ...feedRef.current];
        setLiveFeed(feedRef.current.slice(0, 5));

        // Dynamically update chart if delivery event happens
        if (data.type === 'delivered' && data.progress) {
            setChartData(prev => {
                const updated = [...prev];
                updated.push({ time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), delivered: data.progress.delivered });
                if (updated.length > 12) updated.shift();
                return updated;
            });
        }

        // Refresh stats if campaigns completed or queued
        if (['queued', 'completed', 'delivered', 'failed'].includes(data.type)) {
          axios.get('https://crm-native-ai-1.onrender.com/api/realtime/stats')
            .then(res => setStats(res.data))
            .catch(() => {});
        }
      } catch (_) {}
    };

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  const aiInsights = stats ? [
    `System analysis complete. The overall delivery rate stabilized at ${stats.campaigns.deliveryRate}%.`,
    `You currently have ${stats.customers.highRisk} customers identified as high churn risk in the database.`,
    `Active monitoring of ${stats.campaigns.total} historical campaigns is proceeding nominally. System scaling dynamically.`
  ] : ["Analyzing telemetry...", "Compiling AI insights...", "Awaiting data..."];

  const activeRec = recommendations.length > 0 ? recommendations[activeRecIndex] : null;
  const activeSpotlight = stats?.topAtRiskCustomers?.length > 0 ? stats.topAtRiskCustomers[activeSpotlightIndex] : null;

  return (
    <div className="xn-app-layout">
      <Sidebar />

      <main className="xn-page-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="xn-page-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconActivity /> Dynamic Command Center
            </h1>
            <div style={{ marginTop: 14, marginBottom: 4, padding: '16px 20px', background: 'linear-gradient(135deg, rgba(249,115,22,0.1), transparent)', borderLeft: '4px solid #F97316', borderRadius: '8px 12px 12px 8px' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Hello, <span style={{ color: '#F97316' }}>{userEmail || 'Welcome back'}</span>! 👋
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
                Welcome to your real-time telemetry and rotating AI intelligence.
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: connected ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', 
            border: `1px solid ${connected ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
            color: connected ? '#16A34A' : '#DC2626', 
            fontSize: 12, fontWeight: 700,
            padding: '7px 14px', borderRadius: 20
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: connected ? '#22C55E' : '#EF4444',
              boxShadow: `0 0 0 3px ${connected ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, display: 'inline-block',
              animation: connected ? 'sbPulse 1.5s infinite' : 'none'
            }}/>
            {connected ? 'LIVE CONNECTION' : 'Reconnecting...'}
          </div>
        </div>

        {loading || !stats ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12, color: 'var(--text-muted)', fontSize: 14 }}>
            <span style={{ width: 20, height: 20, border: '3px solid #E5E7EB', borderTopColor: '#F97316', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }}/>
            <span style={{ fontWeight: 600, letterSpacing: '.3px' }}>Syncing telemetry stream…</span>
          </div>
        ) : (
          <>
            {/* Top Row: 4 Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                <MetricCard index={0} label="Total Targeted"   value={stats.campaigns.totalSent}      color='var(--text-main)' icon={null} />
                <MetricCard index={1} label="Delivered"        value={stats.campaigns.totalDelivered} color="#16A34A" icon={<IconShieldCheck />} />
                <MetricCard index={2} label="Failed Drops"     value={stats.campaigns.totalFailed}    color="#DC2626" icon={<IconAlert />} />
                <MetricCard index={3} label="Delivery Rate"    value={`${stats.campaigns.deliveryRate}%`}   color="#D97706" icon={<IconRefresh />} tag="Stable" onRefresh={loadDashboardData} />
            </div>

            {/* Middle Row: AI Recommendations & Customer Spotlight */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Dynamic Recommendation Panel */}
                <div className="xn-card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(249,115,22,.08), var(--bg-card))', border: '1px solid rgba(249,115,22,.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 12, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '.6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IconSparkles /> Live AI Recommendation
                        </h3>
                        {recommendations.length > 0 && (
                            <div style={{ display: 'flex', gap: 4 }}>
                                {recommendations.map((_, i) => (
                                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === activeRecIndex ? '#F97316' : '#FED7AA', transition: 'background .3s' }} />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {activeRec ? (
                        <div style={{ animation: 'fadeUp .4s ease both' }} key={activeRec.id}>
                            <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>{activeRec.title}</h4>
                            <p style={{ fontSize: 13, color: '#4B5563', marginBottom: 16, lineHeight: 1.5 }}>
                                <strong style={{ color: '#F97316' }}>Action:</strong> {activeRec.action} <br/>
                                <span style={{ opacity: 0.8 }}>Impact: {activeRec.impact}</span>
                            </p>
                            <button 
                                onClick={() => navigate('/agent', { state: { prefillAudience: activeRec.title } })}
                                style={{ width: '100%', padding: '10px', background: '#F97316', color: 'var(--bg-card)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,.25)', transition: 'transform .1s' }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <IconRocket /> Execute AI Strategy
                            </button>
                        </div>
                    ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Analyzing data for new recommendations...</p>
                    )}
                </div>

                {/* AI Customer Spotlight Widget */}
                <div className="xn-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 11, fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '.6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IconUser /> Customer Spotlight
                        </h3>
                        {stats.topAtRiskCustomers?.length > 0 && (
                            <div style={{ display: 'flex', gap: 3 }}>
                                {stats.topAtRiskCustomers.map((_, i) => (
                                    <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === activeSpotlightIndex ? '#4B5563' : '#E5E7EB', transition: 'background .3s' }} />
                                ))}
                            </div>
                        )}
                    </div>

                    {activeSpotlight ? (
                        <div style={{ animation: 'fadeIn .4s ease both' }} key={activeSpotlight._id}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{activeSpotlight.name}</h4>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '3px 8px', borderRadius: 12, display: 'inline-block', marginBottom: 10 }}>
                                {activeSpotlight.churnRiskScore}% Churn Risk
                            </div>
                            <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, marginBottom: 0 }}>
                                Has spent ₹{activeSpotlight.totalSpent} over {activeSpotlight.visits} visits, but hasn't ordered since {new Date(activeSpotlight.lastOrderDate).toLocaleDateString()}. Needs immediate retention offer.
                            </p>
                        </div>
                    ) : (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No high-risk customers found.</p>
                    )}
                </div>
            </div>

            {/* Bottom Row: Area Chart & Telemetry */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16, flex: 1, minHeight: 280 }}>
                
                {/* Real-time Delivery Chart */}
                <div className="xn-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        Live Delivery Trajectory
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#22C55E', background: '#DCFCE7', padding: '2px 8px', borderRadius: 12 }}>Updating Live</span>
                    </h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--border-light)' />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="delivered" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorDelivered)" animationDuration={1000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: AI Post-Mortem & Event Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    
                    <div style={{
                        background: 'linear-gradient(135deg, #0F0F0F, #1A1A2E)',
                        borderRadius: 16, padding: '22px 24px',
                        border: '1px solid rgba(249,115,22,.3)',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,.15)'
                    }}>
                        <div style={{ position: 'absolute', top: -10, right: -10, opacity: .08 }}>
                            <svg width="120" height="120" fill="#F97316" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ fontSize: 12, fontWeight: 800, color: '#F97316', letterSpacing: '.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <IconZap /> System Insights
                            </h3>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {[0,1,2].map(i => (
                                    <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === activeInsightIndex ? '#F97316' : '#4B5563', transition: 'background .3s' }} />
                                ))}
                            </div>
                        </div>
                        <div key={activeInsightIndex} style={{ animation: 'fadeIn .4s ease both' }}>
                            <p style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.6, fontWeight: 500, position: 'relative', zIndex: 1, margin: 0 }}>
                                "{aiInsights[activeInsightIndex]}"
                            </p>
                        </div>
                    </div>

                    <div className="xn-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                        <IconTerminal /> Telemetry Stream
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
                        {liveFeed.length === 0 ? (
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Awaiting data stream...</div>
                        ) : (
                            liveFeed.map((log, i) => (
                            <div key={log.id} style={{ fontSize: 11.5, lineHeight: 1.5, display: 'flex', gap: 8, animation: 'fadeUp .3s ease both' }}>
                                <span style={{ color: log.type === 'failed' ? '#EF4444' : '#F97316', fontFamily: 'monospace', fontSize: 10, flexShrink: 0, marginTop: 1 }}>[{log.time}]</span>
                                <span style={{ color: i === 0 ? 'var(--text-main)' : '#6B7280', fontWeight: i === 0 ? 600 : 400, wordBreak: 'break-word' }}>
                                {log.text}
                                </span>
                            </div>
                            ))
                        )}
                        </div>
                    </div>
                </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
