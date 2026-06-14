import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RiskScatterPlot = ({ customers }) => {
  const timestamps = customers.map(c => new Date(c.lastOrderDate).getTime()).filter(t => !isNaN(t));
  const maxTs = timestamps.length ? Math.max(...timestamps) : Date.now();
  
  // Clamp X-axis to max 2 years back from the newest order to prevent outlier dates (e.g. 2005) from ruining the scale
  const TWO_YEARS = 2 * 365 * 24 * 60 * 60 * 1000;
  const clampMinTs = maxTs - TWO_YEARS;

  const chartData = customers.map(c => {
    const originalTs = new Date(c.lastOrderDate).getTime();
    // If the date is older than 2 years from the max date, clamp it to the left edge of the chart
    const plotTs = originalTs < clampMinTs ? clampMinTs : originalTs;
    
    return {
      ...c,
      timestamp: plotTs,
      originalTs: originalTs,
      dateStr: new Date(originalTs).toLocaleDateString()
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'var(--text-main)', color: 'var(--bg-card)', padding: '10px 14px', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,.2)', border: '1px solid rgba(79,70,229,.2)' }}>
          <p style={{ fontWeight: 700, color: '#4F46E5', marginBottom: 5 }}>{d.name}</p>
          <p>Total Spent: <span style={{ color: '#22C55E', fontWeight: 600 }}>₹{d.totalSpent}</span></p>
          <p>Last Order: <span style={{ color: '#D1D5DB' }}>{d.dateStr}</span></p>
          <p>Risk Score: <span style={{ color: d.churnRiskScore > 75 ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{d.churnRiskScore}/100</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '4px 4px 0' }}>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Spend vs. Recency Matrix</h3>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Visualizing high-value targets by flight risk</p>
      </div>
      <div style={{ height: 260, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--border-light)' />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin - 864000000', 'dataMax + 864000000']}
              tickFormatter={ts => new Date(ts).toLocaleDateString()}
              stroke="#E5E7EB"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            />
            <YAxis
              dataKey="totalSpent"
              type="number"
              unit="₹"
              stroke="#E5E7EB"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Customers" data={chartData}>
              {chartData.map((entry, i) => {
                const color = entry.churnRiskScore > 75 ? '#EF4444' : entry.churnRiskScore >= 40 ? '#4F46E5' : '#22C55E';
                return <Cell key={i} fill={color} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'flex-end' }}>
        {[['#22C55E', 'Low Risk'], ['#4F46E5', 'Medium Risk'], ['#EF4444', 'High Risk']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#6B7280', fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskScatterPlot;
