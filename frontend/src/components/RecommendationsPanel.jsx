const IconSparkles = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 2l1.5 6H20l-5.5 4 2 6L12 14.5 7.5 18l2-6L4 8h6.5L12 2z"/>
  </svg>
);

const RecommendationsPanel = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="xn-card">
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#06B6D4' }}><IconSparkles /></span> Smart AI Recommendations
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{
              background: 'var(--bg-ghost)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 10,
              padding: '13px 16px',
              cursor: 'pointer',
              transition: 'border-color .2s, background .2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.background = '#EEF2FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-ghost)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{rec.title}</h4>
              <span style={{
                fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.4px',
                background: rec.type === 'urgent' ? '#FEE2E2' : '#DCFCE7',
                color: rec.type === 'urgent' ? '#DC2626' : '#16A34A'
              }}>
                {rec.type}
              </span>
            </div>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#06B6D4', marginBottom: 3 }}>{rec.action}</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{rec.impact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
