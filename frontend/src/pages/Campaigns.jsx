import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

/* ── icons ── */
const IconMegaphone   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>;
const IconActivity    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconCheck       = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IconXCircle     = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconMail        = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const IconMsg         = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconPhone       = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IconUsers       = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconX           = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLoader      = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: 'spin .7s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;

const channelIcon = ch => ch === 'email' ? <IconMail /> : ch === 'whatsapp' ? <IconMsg /> : <IconPhone />;

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [audienceData, setAudienceData] = useState([]);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [selectedCampaignName, setSelectedCampaignName] = useState('');

  useEffect(() => {
    axios.get('https://crm-native-ai-1.onrender.com/api/campaigns')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleViewAudience = async (id, name) => {
    setIsAudienceOpen(true);
    setLoadingAudience(true);
    setSelectedCampaignName(name);
    setAudienceData([]);
    try {
      const res = await axios.get(`https://crm-native-ai-1.onrender.com/api/campaigns/${id}/customers`);
      setAudienceData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAudience(false); }
  };

  const getDemographicStats = (data) => {
    let female = 0, male = 0;
    let ageBuckets = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    data.forEach(c => {
      if (c.gender === 'Female') female++;
      if (c.gender === 'Male') male++;
      if (c.ageGroup && ageBuckets[c.ageGroup] !== undefined) ageBuckets[c.ageGroup]++;
    });
    const total = data.length || 1;
    return {
      femalePct: Math.round((female / total) * 100),
      malePct: Math.round((male / total) * 100),
      ageBuckets,
      total
    };
  };

  return (
    <div className="xn-app-layout" style={{ position: 'relative' }}>
      <Sidebar />

      <main className="xn-page-content">
        {/* Header */}
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconMegaphone /> Campaign Memory
            </h1>
            <p className="xn-page-sub">Retrieve and analyze dispatched AI campaigns</p>
          </div>
          <Link to="/agent" className="xn-btn-primary">+ New Campaign</Link>
        </div>

        {/* Campaign list */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <IconLoader /> Loading campaign memory…
          </div>
        ) : campaigns.length === 0 ? (
          <div className="xn-card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 15, marginBottom: 6 }}>No campaigns in memory yet.</p>
            <p style={{ fontSize: 13 }}>Go to the AI Campaign Agent to dispatch one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {campaigns.map((camp, i) => (
              <div key={camp._id} className="xn-card xn-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{camp.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Audience: <strong style={{ color: 'var(--text-ghost)' }}>{camp.audience}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                        {channelIcon(camp.channel)} {camp.channel}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                    <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconCheck /> {camp.status}
                    </span>
                    {camp.stats?.sent > 0 && (
                      <button
                        onClick={() => handleViewAudience(camp._id, camp.name)}
                        style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <IconUsers /> View List
                      </button>
                    )}
                  </div>
                </div>

                {/* Message */}
                <p style={{ fontSize: 13, color: '#6B7280', background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '12px 14px', fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>
                  "{camp.message}"
                </p>

                {/* Stats */}
                <div className="xn-grid-responsive xn-fade-up" style={{ gap: 10, animationDelay: '0.1s' }}>
                  {[
                    { icon: <IconActivity />, label: 'Total Sent', val: camp.stats?.sent || 0, color: 'var(--text-ghost)' },
                    { icon: <IconCheck />, label: 'Delivered', val: camp.stats?.delivered || 0, color: '#16A34A' },
                    { icon: <IconXCircle />, label: 'Failed', val: camp.stats?.failed || 0, color: '#DC2626' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '10px 13px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: s.color }}>{s.icon}</span> {s.label}
                      </span>
                      <p style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Audience Drawer */}
      {isAudienceOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }} onClick={() => setIsAudienceOpen(false)} />
          <div style={{ position: 'relative', width: 400, background: 'var(--bg-card)', height: '100%', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 7 }}><IconUsers /> Target Audience</span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{selectedCampaignName}</p>
              </div>
              <button onClick={() => setIsAudienceOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><IconX /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {loadingAudience ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: 'var(--text-muted)' }}>
                  <IconLoader /> <span style={{ fontSize: 12 }}>Decrypting customer list…</span>
                </div>
              ) : audienceData.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 13 }}>No customer profile data found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Demographic Analysis Panel */}
                  <div style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '16px', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconActivity /> Audience Demographics
                    </h4>
                    
                    {/* Gender Split */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                        <span style={{ color: '#EC4899' }}>Female: {getDemographicStats(audienceData).femalePct}%</span>
                        <span style={{ color: '#3B82F6' }}>Male: {getDemographicStats(audienceData).malePct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: 'var(--border-light)', display: 'flex', overflow: 'hidden' }}>
                        <div style={{ width: `${getDemographicStats(audienceData).femalePct}%`, background: '#EC4899' }} />
                        <div style={{ width: `${getDemographicStats(audienceData).malePct}%`, background: '#3B82F6' }} />
                      </div>
                    </div>

                    {/* Age Breakdown */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Age Distribution</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 40 }}>
                        {Object.entries(getDemographicStats(audienceData).ageBuckets).map(([age, count], idx) => {
                          const heightPct = Math.max((count / getDemographicStats(audienceData).total) * 100, 5);
                          return (
                            <div key={age} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                              <div style={{ width: '100%', height: `${heightPct}%`, background: '#A78BFA', borderRadius: '4px 4px 0 0', opacity: heightPct > 5 ? 1 : 0.2 }} />
                              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{age}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {audienceData.map((u, i) => (
                    <div key={i} style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '10px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name || 'Unknown'} 
                          {u.gender && (
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: u.gender === 'Female' ? '#EC4899' : '#3B82F6' }}>
                              {u.gender}
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{u.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>LTV</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#4F46E5' }}>₹{u.totalSpent || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 20px', background: 'var(--bg-ghost)', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Displaying {audienceData.length} records</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
