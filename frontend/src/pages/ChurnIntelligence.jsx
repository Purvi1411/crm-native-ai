import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from 'recharts';

const IconAlert = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const RISK_COLORS = { high: '#EF4444', medium: '#F97316', low: '#22C55E' };

const riskLabel = score => score > 75 ? 'high' : score >= 40 ? 'medium' : 'low';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'var(--text-main)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(239,68,68,.25)', fontSize: 12, color: 'var(--bg-card)' }}>
      <p style={{ fontWeight: 700, color: '#F97316', marginBottom: 4 }}>{d.name}</p>
      <p>Churn Risk: <span style={{ color: RISK_COLORS[riskLabel(d.churnRiskScore)], fontWeight: 700 }}>{d.churnRiskScore}/100</span></p>
      <p>Total Spent: <span style={{ color: '#22C55E' }}>₹{d.totalSpent?.toLocaleString()}</span></p>
      <p>Visits: <span style={{ color: '#A78BFA' }}>{d.visits}</span></p>
    </div>
  );
};

export default function ChurnIntelligence() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState('all');

  useEffect(() => {
    axios.get('https://crm-native-ai-1.onrender.com/api/customers')
      .then(r => setCustomers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = customers.map(c => ({
    ...c,
    timestamp: new Date(c.lastOrderDate).getTime(),
    dateStr: new Date(c.lastOrderDate).toLocaleDateString(),
  }));

  const high   = customers.filter(c => c.churnRiskScore > 75);
  const medium = customers.filter(c => c.churnRiskScore >= 40 && c.churnRiskScore <= 75);
  const low    = customers.filter(c => c.churnRiskScore < 40);

  const filtered = selectedRisk === 'all' ? customers : customers.filter(c => riskLabel(c.churnRiskScore) === selectedRisk);

  const buckets = [
    { range: '0-20', count: customers.filter(c => c.churnRiskScore < 20).length },
    { range: '20-40', count: customers.filter(c => c.churnRiskScore >= 20 && c.churnRiskScore < 40).length },
    { range: '40-60', count: customers.filter(c => c.churnRiskScore >= 40 && c.churnRiskScore < 60).length },
    { range: '60-80', count: customers.filter(c => c.churnRiskScore >= 60 && c.churnRiskScore < 80).length },
    { range: '80-100', count: customers.filter(c => c.churnRiskScore >= 80).length },
  ];

  return (
    <div className="xn-app-layout">
      <Sidebar />
      <main className="xn-page-content">
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#EF4444' }}><IconAlert /></span> Churn Intelligence
            </h1>
            <p className="xn-page-sub">Predictive flight-risk analysis across your customer base</p>
          </div>
        </div>

        {/* Risk Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'High Risk',   count: high.length,   color: '#EF4444', bg: 'rgba(239,68,68,.07)',   desc: 'Churn score > 75 — Immediate action required', key: 'high'   },
            { label: 'Medium Risk', count: medium.length, color: '#F97316', bg: 'rgba(79,70,229,.07)',  desc: 'Churn score 40–75 — Monitor closely',           key: 'medium' },
            { label: 'Low Risk',    count: low.length,    color: '#22C55E', bg: 'rgba(34,197,94,.07)',   desc: 'Churn score < 40 — Healthy & engaged',          key: 'low'    },
          ].map(r => (
            <button key={r.key} onClick={() => setSelectedRisk(selectedRisk === r.key ? 'all' : r.key)}
              style={{
                border: `2px solid ${selectedRisk === r.key ? r.color : r.color + '30'}`,
                background: r.bg, borderRadius: 14, padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
                transition: 'all .15s', fontFamily: 'Inter, sans-serif'
              }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.color, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{r.label}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{loading ? '…' : r.count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{r.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>
          {/* Scatter plot */}
          <div className="xn-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Risk vs. Spending Matrix</h3>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>Bubble color = risk level. Hover for details.</p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--border-light)' />
                <XAxis dataKey="visits" type="number" name="Visits" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" label={{ value: 'Store Visits', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: 'var(--text-muted)' } }} />
                <YAxis dataKey="totalSpent" type="number" name="Spent" unit="₹" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={chartData}>
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={RISK_COLORS[riskLabel(e.churnRiskScore)]} fillOpacity={0.85} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 6 }}>
              {Object.entries(RISK_COLORS).map(([k, c]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#6B7280' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{k.charAt(0).toUpperCase() + k.slice(1)} Risk
                </div>
              ))}
            </div>
          </div>

          {/* Risk distribution histogram */}
          <div className="xn-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Score Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={buckets} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--border-light)' />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--text-main)', border: 'none', borderRadius: 8, fontSize: 12, color: 'var(--bg-card)' }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {buckets.map((b, i) => {
                    const midScore = parseInt(b.range.split('-')[0]) + 10;
                    return <Cell key={i} fill={midScore > 75 ? '#EF4444' : midScore >= 40 ? '#F97316' : '#22C55E'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-risk customer table */}
        <div className="xn-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
              {selectedRisk === 'all' ? 'All Customers' : `${selectedRisk.charAt(0).toUpperCase() + selectedRisk.slice(1)} Risk Customers`}
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>({filtered.length})</span>
            </h3>
            <button onClick={() => setSelectedRisk('all')} style={{ fontSize: 11, color: '#F97316', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              {selectedRisk !== 'all' ? 'Clear filter' : ''}
            </button>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="xn-table">
              <thead><tr><th>Customer</th><th>Email</th><th style={{ textAlign: 'right' }}>Churn Score</th><th style={{ textAlign: 'right' }}>Total Spent</th><th>Risk Level</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Loading…</td></tr>
                ) : filtered.map(c => {
                  const rl = riskLabel(c.churnRiskScore);
                  return (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</td>
                      <td style={{ color: '#6B7280' }}>{c.email}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 48, height: 5, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${c.churnRiskScore}%`, height: '100%', background: RISK_COLORS[rl], borderRadius: 3 }} />
                          </div>
                          <span style={{ fontWeight: 700, color: RISK_COLORS[rl] }}>{c.churnRiskScore}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#22C55E' }}>₹{c.totalSpent?.toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: RISK_COLORS[rl] + '20', color: RISK_COLORS[rl] }}>
                          {rl.charAt(0).toUpperCase() + rl.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
