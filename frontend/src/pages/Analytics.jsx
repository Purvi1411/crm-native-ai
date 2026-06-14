import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import GeoMap from '../components/GeoMap';
import WorldMap from '../components/WorldMap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const IconBarChart = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

const COLORS = ['#F97316', '#3B82F6', '#22C55E', '#A78BFA'];
const CHURN_COLORS = ['#EF4444', '#F59E0B', '#22C55E']; // Red, Orange, Green

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-light)', fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
      <p style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: 5 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, margin: '2px 0' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('weekly');

  useEffect(() => {
    Promise.all([
      axios.get('https://crm-native-ai-1.onrender.com/api/campaigns'),
      axios.get('https://crm-native-ai-1.onrender.com/api/customers')
    ]).then(([campRes, custRes]) => {
      setCampaigns(campRes.data);
      setCustomers(custRes.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Calculate Avg Open Rate dynamically
  const totalSent      = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
  const totalDelivered = campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0);
  const totalFailed    = campaigns.reduce((s, c) => s + (c.stats?.failed || 0), 0);
  const deliveryRate   = totalSent ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;
  
  const totalOpens = campaigns.reduce((s, c) => s + (c.stats?.opened || 0), 0);
  const avgOpenRate = totalDelivered ? ((totalOpens / totalDelivered) * 100).toFixed(1) : 0;

  // Build day-to-day volume data
  const getVolumeData = (range) => {
    const dataMap = {};
    const now = new Date();

    if (range === 'yearly') {
      // Last 12 months
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      for(let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        dataMap[dateStr] = { date: dateStr, Sent: 0 };
      }
      campaigns.forEach(c => {
        const cDate = new Date(c.createdAt || new Date());
        if (cDate >= cutoff) {
          const dateStr = cDate.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
          if (dataMap[dateStr]) dataMap[dateStr].Sent += (c.stats?.sent || 0);
        }
      });
    } else {
      const days = range === 'monthly' ? 30 : 7;
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - days);
      for(let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        dataMap[dateStr] = { date: dateStr, Sent: 0 };
      }
      campaigns.forEach(c => {
        const cDate = new Date(c.createdAt || new Date());
        if (cDate >= cutoff) {
          const dateStr = cDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (dataMap[dateStr]) dataMap[dateStr].Sent += (c.stats?.sent || 0);
        }
      });
    }
    return Object.values(dataMap);
  };

  const volumeData = getVolumeData(timeRange);

  const highRisk = customers.filter(c => c.churnRiskScore >= 75).length;
  const mediumRisk = customers.filter(c => c.churnRiskScore >= 40 && c.churnRiskScore < 75).length;
  const lowRisk = customers.filter(c => c.churnRiskScore < 40).length;

  const pieData = [
    { name: 'High Risk', value: highRisk },
    { name: 'Medium Risk', value: mediumRisk },
    { name: 'Low Risk', value: lowRisk }
  ].filter(d => d.value > 0);

  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const ageData = ageGroups.map(group => ({
    name: group,
    Count: customers.filter(c => c.ageGroup === group).length || 0
  }));

  const genderData = [
    { name: 'Men', value: customers.filter(c => c.gender === 'Male').length },
    { name: 'Women', value: customers.filter(c => c.gender === 'Female').length },
    { name: 'Other', value: customers.filter(c => c.gender && !['Male', 'Female'].includes(c.gender)).length }
  ].filter(g => g.value > 0);

  // Channel rates derived from campaign channels if available, otherwise 0 if empty
  const channelData = campaigns.length > 0 ? [
    { channel: 'WhatsApp', rate: Math.min(100, Math.floor(avgOpenRate * 1.1)) },
    { channel: 'Email',    rate: Math.min(100, Math.floor(avgOpenRate * 0.8)) },
    { channel: 'SMS',      rate: Math.min(100, Math.floor(avgOpenRate * 0.9)) },
  ] : [];

  return (
    <div className="xn-app-layout">
      <Sidebar />
      <main className="xn-page-content">
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconBarChart /> Analytics
            </h1>
            <p className="xn-page-sub">Campaign performance insights and delivery intelligence</p>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Last 7 days · All Channels</span>
        </div>

        {/* KPI row */}
        <div className="xn-grid-responsive xn-fade-up" style={{ gap: 14, marginBottom: 22, animationDelay: '0.1s' }}>
          {[
            { label: 'Total Sent',     value: totalSent,      color: 'var(--text-main)', sub: 'messages dispatched' },
            { label: 'Delivered',      value: totalDelivered, color: '#22C55E', sub: `${deliveryRate}% delivery rate` },
            { label: 'Failed',         value: totalFailed,     color: '#EF4444', sub: 'need cleanup'        },
            { label: 'Avg Open Rate',  value: `${avgOpenRate}%`, color: '#F97316', sub: 'across channels'    },
          ].map(k => (
            <div key={k.label} className="xn-metric-card">
              <div className="xn-metric-label">{k.label}</div>
              <div className="xn-metric-value" style={{ color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Geo Map Row */}
        <div className="xn-grid-responsive xn-fade-up" style={{ gap: 16, marginBottom: 16, animationDelay: '0.2s' }}>
          <GeoMap customers={customers} />
          <WorldMap customers={customers} />
        </div>

        {/* Row 1: Bar chart + Pie */}
        <div className="xn-grid-responsive xn-fade-up" style={{ gap: 16, marginBottom: 16, animationDelay: '0.3s' }}>
          <div className="xn-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Campaign Volume Over Time</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={() => setTimeRange('weekly')} 
                  className={timeRange === 'weekly' ? 'xn-btn-primary' : 'xn-btn-ghost'}
                  style={{ padding: '4px 10px', fontSize: 11, minHeight: 'unset' }}>
                  Weekly
                </button>
                <button 
                  onClick={() => setTimeRange('monthly')} 
                  className={timeRange === 'monthly' ? 'xn-btn-primary' : 'xn-btn-ghost'}
                  style={{ padding: '4px 10px', fontSize: 11, minHeight: 'unset' }}>
                  Monthly
                </button>
                <button 
                  onClick={() => setTimeRange('yearly')} 
                  className={timeRange === 'yearly' ? 'xn-btn-primary' : 'xn-btn-ghost'}
                  style={{ padding: '4px 10px', fontSize: 11, minHeight: 'unset' }}>
                  Yearly
                </button>
              </div>
            </div>
            
            {loading ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading chart data…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeData} barSize={timeRange === 'weekly' ? 24 : 8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--border-light)' />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} stroke="transparent" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Sent" fill="#3B82F6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="xn-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>Customer Churn Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={CHURN_COLORS[i % CHURN_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Demographic Intelligence */}
        <div className="xn-grid-responsive xn-fade-up" style={{ gap: 16, marginBottom: 16, animationDelay: '0.4s' }}>
          <div className="xn-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>Customer Age Group Distribution</h3>
            {loading ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading demographics…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--border-light)' />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} stroke="transparent" />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} stroke="transparent" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.05)' }} />
                  <Bar dataKey="Count" fill="#A78BFA" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="xn-card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>Gender Distribution</h3>
            {loading ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {genderData.map((entry, i) => <Cell key={i} fill={entry.name === 'Men' ? '#3B82F6' : entry.name === 'Women' ? '#EC4899' : '#A78BFA'} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>


      </main>
    </div>
  );
}
