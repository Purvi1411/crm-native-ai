import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

// ── Event type metadata ──────────────────────────────────────────
const TYPE_META = {
  queued:    { color: '#3B82F6', bg: 'rgba(59,130,246,.1)',   label: 'QUEUED',    dot: '#3B82F6' },
  delivered: { color: '#22C55E', bg: 'rgba(34,197,94,.1)',   label: 'DELIVERED', dot: '#22C55E' },
  completed: { color: '#A78BFA', bg: 'rgba(167,139,250,.1)', label: 'COMPLETE',  dot: '#A78BFA' },
  failed:    { color: '#EF4444', bg: 'rgba(239,68,68,.1)',   label: 'FAILED',    dot: '#EF4444' },
  retry:     { color: '#4F46E5', bg: 'rgba(79,70,229,.1)',  label: 'RETRY',     dot: '#4F46E5' },
  ai:        { color: '#F59E0B', bg: 'rgba(245,158,11,.1)',  label: 'AI AGENT',  dot: '#F59E0B' },
  connected: { color: 'var(--text-muted)', bg: 'rgba(156,163,175,.1)', label: 'SYSTEM',    dot: 'var(--text-muted)' },
};

const CHANNEL_COLOR = {
  whatsapp: '#22C55E', email: '#3B82F6', sms: '#4F46E5',
  rcs: '#8B5CF6', ai: '#F59E0B', system: '#6B7280',
};

// ── Icons ────────────────────────────────────────────────────────
const IconRadio  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/></svg>;
const IconClear  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

// ── Stat card ────────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg, sub }) => (
  <div className="xn-metric-card" style={{ background: bg, border: `1px solid ${color}22` }}>
    <div className="xn-metric-label">{label}</div>
    <div className="xn-metric-value" style={{ color, fontSize: 28 }}>{value}</div>
    {sub && <div style={{ fontSize: 10.5, color, marginTop: 4, opacity: .7 }}>{sub}</div>}
  </div>
);

export default function LiveMonitor() {
  const [feed,   setFeed]   = useState([]);
  const [filter, setFilter] = useState('all');
  const [connected, setConnected] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const esRef = useRef(null);
  const feedRef = useRef([]);

  // ── Push an event into the feed ───────────────────────────────
  const pushEvent = (ev) => {
    const entry = {
      id:      ev.id || `${ev.type}-${Date.now()}-${Math.random()}`,
      type:    ev.type   || 'system',
      channel: ev.channel || 'system',
      text:    ev.text   || ev.message || '',
      time:    ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
      progress: ev.progress || null,
      stats:   ev.stats   || null,
    };
    feedRef.current = [entry, ...feedRef.current].slice(0, 100);
    setFeed([...feedRef.current]);
  };

  // ── Load historical events from DB on mount ───────────────────
  useEffect(() => {
    axios.get('https://crm-native-ai-1.onrender.com/api/realtime/monitor-feed')
      .then(r => {
        const historical = r.data.events || [];
        feedRef.current = historical;
        setFeed([...historical]);
      })
      .catch(() => {});

    axios.get('https://crm-native-ai-1.onrender.com/api/campaigns')
      .then(r => setCampaigns(r.data))
      .catch(() => {});
  }, []);

  // ── Poll campaigns every 5s to update progress bars ──────────
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('https://crm-native-ai-1.onrender.com/api/campaigns')
        .then(r => setCampaigns(r.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Connect to real SSE stream ────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const es = new EventSource(`https://crm-native-ai-1.onrender.com/api/realtime/events?token=${token}`);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      pushEvent({ type: 'connected', channel: 'system', text: 'Connected to XenoReach real-time event stream', timestamp: new Date().toISOString() });
    };

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') return; // skip the server's own connect message
        pushEvent(data);

        // If a campaign event, refresh campaign list too
        if (['queued', 'completed'].includes(data.type)) {
          axios.get('https://crm-native-ai-1.onrender.com/api/campaigns')
            .then(r => setCampaigns(r.data))
            .catch(() => {});
        }
      } catch (_) {}
    };

    es.onerror = () => {
      setConnected(false);
      // Auto-reconnect handled by EventSource natively
    };

    return () => es.close();
  }, []);

  const filtered = filter === 'all' ? feed : feed.filter(e => e.type === filter);

  const stats = {
    delivered: campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0),
    failed:    campaigns.reduce((s, c) => s + (c.stats?.failed || 0), 0),
    queued:    campaigns.length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="xn-app-layout">
      <Sidebar />
      <main className="xn-page-content">

        {/* ── Header ── */}
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#22C55E' }}><IconRadio /></span>
              Live Monitor
            </h1>
            <p className="xn-page-sub">
              Real events from campaign dispatches — no simulated data
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: connected ? '#F0FDF4' : '#FEF2F2',
              border: `1.5px solid ${connected ? '#BBF7D0' : '#FECACA'}`,
              color: connected ? '#16A34A' : '#DC2626',
              fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 20
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: connected ? '#22C55E' : '#EF4444',
                display: 'inline-block',
                animation: connected ? 'sbPulse 1.5s infinite' : 'none'
              }} />
              {connected ? 'SSE LIVE' : 'Reconnecting…'}
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <StatCard label="Queued"    value={stats.queued}    color="#3B82F6" bg="rgba(59,130,246,.06)"   sub="campaigns dispatched" />
          <StatCard label="Delivered" value={stats.delivered} color="#22C55E" bg="rgba(34,197,94,.06)"   sub="messages delivered"  />
          <StatCard label="Failed"    value={stats.failed}    color="#EF4444" bg="rgba(239,68,68,.06)"   sub="messages dropped"        />
          <StatCard label="Completed" value={stats.completed} color="#A78BFA" bg="rgba(167,139,250,.06)" sub="campaigns finished"   />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

          {/* ── Real-time feed ── */}
          <div className="xn-card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', 'queued', 'delivered', 'failed', 'completed', 'ai'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '4px 11px', borderRadius: 20, fontSize: 10.5, fontWeight: 700,
                    cursor: 'pointer', border: '1.5px solid', textTransform: 'uppercase', letterSpacing: '.4px', transition: 'all .15s',
                    background: filter === f ? '#4F46E5' : 'transparent',
                    color: filter === f ? 'var(--bg-card)' : 'var(--text-muted)',
                    borderColor: filter === f ? '#4F46E5' : 'transparent'
                  }}>{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
              <button
                onClick={() => { feedRef.current = []; setFeed([]); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                <IconClear /> Clear
              </button>
            </div>

            {/* Events list */}
            <div style={{ height: 460, overflowY: 'auto', padding: '8px 16px' }}>
              {filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 10 }}>
                  <IconRadio />
                  <p style={{ fontSize: 13, fontWeight: 500 }}>
                    {connected ? 'Waiting for campaign events…' : 'Connecting to event stream…'}
                  </p>
                  <p style={{ fontSize: 11.5 }}>Dispatch a campaign to see real-time events appear here.</p>
                </div>
              ) : (
                filtered.map((ev, i) => {
                  const m  = TYPE_META[ev.type]    || TYPE_META.connected;
                  const cc = CHANNEL_COLOR[ev.channel] || '#6B7280';
                  return (
                    <div key={ev.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 0',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                      animation: i === 0 ? 'fadeUp .3s ease both' : 'none'
                    }}>
                      {/* Status dot */}
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: m.dot,
                        flexShrink: 0, marginTop: 5,
                        boxShadow: `0 0 0 3px ${m.dot}22`
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ background: m.bg, color: m.color, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, letterSpacing: '.4px', textTransform: 'uppercase' }}>
                            {m.label}
                          </span>
                          {ev.channel && ev.channel !== 'system' && (
                            <span style={{ fontSize: 9, fontWeight: 700, background: `${cc}18`, color: cc, padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                              {ev.channel}
                            </span>
                          )}
                        </div>

                        {/* Message text */}
                        <p style={{ fontSize: 12.5, color: 'var(--text-ghost)', lineHeight: 1.45, wordBreak: 'break-word' }}>{ev.text}</p>

                        {/* Progress bar for delivery events */}
                        {ev.progress && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>
                              <span>{ev.progress.delivered}/{ev.progress.total} delivered</span>
                              <span style={{ color: '#EF4444' }}>{ev.progress.failed} failed</span>
                            </div>
                            <div style={{ background: 'var(--border-light)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.round((ev.progress.delivered / Math.max(ev.progress.total, 1)) * 100)}%`,
                                height: '100%', background: '#22C55E', borderRadius: 4, transition: 'width .4s ease'
                              }} />
                            </div>
                          </div>
                        )}

                        {/* Final stats pill */}
                        {ev.stats && (
                          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 12 }}>✓ {ev.stats.delivered} delivered</span>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: 12 }}>✗ {ev.stats.failed} failed</span>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span style={{ fontSize: 9.5, color: '#C4C9D4', fontFamily: 'monospace', flexShrink: 0, paddingTop: 4 }}>
                        {ev.time}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Active campaigns */}
            <div className="xn-card">
              <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Campaign Status</h3>
              {campaigns.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No campaigns yet — dispatch one to see live progress!
                </p>
              ) : (
                campaigns.slice(0, 6).map((c, i) => {
                  const pct = c.stats?.sent > 0
                    ? Math.round((c.stats.delivered / c.stats.sent) * 100)
                    : 0;
                  const isLive = c.status === 'sending';
                  return (
                    <div key={c._id} style={{ padding: '9px 0', borderBottom: i < campaigns.slice(0,6).length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>
                          {c.name}
                        </span>
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, padding: '1px 7px', borderRadius: 10, whiteSpace: 'nowrap',
                          background: isLive ? 'rgba(59,130,246,.1)' : '#DCFCE7',
                          color: isLive ? '#3B82F6' : '#16A34A',
                          animation: isLive ? 'sbPulse 1.5s infinite' : 'none'
                        }}>
                          {isLive ? '⚡ Sending' : '✓ Done'}
                        </span>
                      </div>

                      {/* Delivery bar */}
                      <div style={{ background: 'var(--border-light)', borderRadius: 4, height: 5, marginBottom: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%', borderRadius: 4,
                          background: isLive ? '#3B82F6' : '#22C55E',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: CHANNEL_COLOR[c.channel] || '#6B7280', display: 'inline-block' }} />
                          {c.channel?.toUpperCase()}
                        </span>
                        <span>{pct}% · {c.stats?.delivered ?? 0}/{c.stats?.sent ?? 0}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Event count breakdown */}
            <div className="xn-card">
              <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Event Breakdown</h3>
              {Object.entries(TYPE_META).filter(([k]) => k !== 'connected').map(([key, m]) => {
                const count = feed.filter(e => e.type === key).length;
                const pct = feed.length ? Math.round((count / feed.length) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '.3px', fontSize: 10 }}>{m.label}</span>
                      <span style={{ color: m.color, fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ background: 'var(--border-light)', borderRadius: 4, height: 5 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: m.dot, borderRadius: 4, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
