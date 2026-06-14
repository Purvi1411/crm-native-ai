import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';

/* ── icons ── */
const IconPlus    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX       = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUsers   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconLoader  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: 'spin .7s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;
const IconTarget  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconRocket  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
const IconTrash   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

const Segments = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSegmentData, setNewSegmentData] = useState({ name: '', criteria: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [audienceData, setAudienceData] = useState([]);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [selectedSegmentName, setSelectedSegmentName] = useState('');

  const fetchSegments = async () => {
    try {
      const res = await axios.get('https://crm-native-ai-1.onrender.com/api/segments');
      setSegments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSegments(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSegmentData.name || !newSegmentData.criteria) return;
    setIsSubmitting(true);
    try {
      await axios.post('https://crm-native-ai-1.onrender.com/api/segments', newSegmentData);
      setIsModalOpen(false);
      setNewSegmentData({ name: '', criteria: '' });
      fetchSegments();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;
    try {
      await axios.delete(`https://crm-native-ai-1.onrender.com/api/segments/${id}`);
      setSegments(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      console.error("Failed to delete segment", e);
      alert('Failed to delete segment');
    }
  };

  const handleViewAudience = async (id, name) => {
    setIsAudienceOpen(true);
    setLoadingAudience(true);
    setSelectedSegmentName(name);
    setAudienceData([]);
    try {
      const res = await axios.get(`https://crm-native-ai-1.onrender.com/api/segments/${id}/customers`);
      setAudienceData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAudience(false); }
  };

  const computeDemographics = () => {
    const genderSplit = { Male: 0, Female: 0 };
    const ageDist = {};
    audienceData.forEach(c => {
      if (c.gender) genderSplit[c.gender] = (genderSplit[c.gender] || 0) + 1;
      if (c.ageGroup) ageDist[c.ageGroup] = (ageDist[c.ageGroup] || 0) + 1;
    });

    const pieData = [
      { name: 'Female', value: genderSplit.Female },
      { name: 'Male', value: genderSplit.Male }
    ].filter(d => d.value > 0);

    const barData = Object.keys(ageDist).map(k => ({ name: k, Count: ageDist[k] })).sort((a,b) => a.name.localeCompare(b.name));
    
    return { pieData, barData };
  };

  const { pieData, barData } = computeDemographics();
  const GENDER_COLORS = { Female: '#BE185D', Male: '#3730A3' };

  return (
    <div className="xn-app-layout" style={{ position: 'relative' }}>
      <Sidebar />

      <main className="xn-page-content">
        {/* Header */}
        <div className="xn-page-header">
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconTarget /> Audience Segments
            </h1>
            <p className="xn-page-sub">Manage dynamically generated AI cohorts</p>
          </div>
          <button className="xn-btn-primary" onClick={() => setIsModalOpen(true)}>
            <IconPlus /> New Segment
          </button>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <IconLoader /> Loading segments…
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {segments.map((seg, i) => (
              <div key={seg._id} className="xn-card xn-fade-up" style={{ animationDelay: `${i * 60}ms`, display: 'flex', flexDirection: 'column' }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{seg.name}</h3>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: '#FFF7ED', color: '#EA580C',
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    border: '1px solid #FED7AA', whiteSpace: 'nowrap'
                  }}>
                    <IconUsers /> {seg.userCount || 0}
                  </span>
                </div>

                {/* Criteria */}
                <div style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '10px 13px', flex: 1, marginBottom: 14 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>AI Targeting Criteria</p>
                  <p style={{ fontSize: 13, color: 'var(--text-ghost)', lineHeight: 1.5 }}>{seg.criteria}</p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                  {seg.userCount > 0 ? (
                    <>
                      <button
                        onClick={() => handleViewAudience(seg._id, seg.name)}
                        className="xn-btn-ghost"
                        style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                      >
                        <IconUsers /> View Customers
                      </button>
                      <button
                        onClick={() => navigate('/agent', { state: { prefillAudience: seg.name, prefillSegmentId: seg._id, prefillCriteria: seg.criteria } })}
                        className="xn-btn-primary"
                        style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                      >
                        <IconRocket /> Campaign
                      </button>
                    </>
                  ) : (
                    <div style={{ flex: 1 }} />
                  )}
                  <button
                    onClick={() => handleDelete(seg._id)}
                    className="xn-btn-ghost"
                    style={{ padding: '6px 10px', color: '#DC2626', borderColor: 'transparent', background: 'rgba(239, 68, 68, 0.1)' }}
                    title="Delete Segment"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Segment Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="xn-card xn-scale-in" style={{ width: '100%', maxWidth: 440, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-ghost)', borderBottom: '1px solid var(--border-light)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <IconTarget /> Create Custom Segment
              </span>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><IconX /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-ghost)', marginBottom: 6 }}>Segment Name</label>
                <input type="text" required className="xn-input" style={{ width: '100%' }}
                  placeholder="e.g., Lapsed VIPs"
                  value={newSegmentData.name}
                  onChange={e => setNewSegmentData({ ...newSegmentData, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-ghost)', marginBottom: 6 }}>Target Criteria</label>
                <input type="text" required className="xn-input" style={{ width: '100%', marginBottom: 10 }}
                  placeholder="e.g., Spend > ₹1000, Female, Age 18-24"
                  value={newSegmentData.criteria}
                  onChange={e => setNewSegmentData({ ...newSegmentData, criteria: e.target.value })} />
                
                {/* Quick Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Female', 'Male', 'Age 18-24', 'Age 25-34', 'Age 35-44'].map(tag => (
                    <button type="button" key={tag} 
                      onClick={() => {
                        const current = newSegmentData.criteria;
                        setNewSegmentData({ ...newSegmentData, criteria: current ? `${current}, ${tag}` : tag });
                      }}
                      style={{ 
                        background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', 
                        color: 'var(--text-ghost)', fontSize: 11, padding: '4px 10px', 
                        borderRadius: 20, cursor: 'pointer', transition: 'all .2s' 
                      }}>
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                <button type="button" className="xn-btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="xn-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <IconLoader /> : null} Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audience Drawer */}
      {isAudienceOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1001, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }} onClick={() => setIsAudienceOpen(false)} />
          <div style={{ position: 'relative', width: 400, background: 'var(--bg-card)', height: '100%', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 7 }}><IconUsers /> Segment Audience</span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{selectedSegmentName}</p>
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
                  
                  {/* Audience DNA Visuals */}
                  {(pieData.length > 0 || barData.length > 0) && (
                    <div style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 12 }}>Audience DNA</h4>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {pieData.length > 0 && (
                          <div style={{ flex: 1, height: 100 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">
                                  {pieData.map((e, i) => <Cell key={i} fill={GENDER_COLORS[e.name]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ fontSize: 10, padding: '4px 8px', borderRadius: 6 }} itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        {barData.length > 0 && (
                          <div style={{ flex: 1.5, height: 100 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={barData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} stroke="transparent" />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ fontSize: 10, padding: '4px 8px', borderRadius: 6 }} />
                                <Bar dataKey="Count" fill="#A78BFA" radius={[2,2,0,0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {audienceData.map((u, i) => (
                    <div key={i} style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '10px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name || 'Unknown'}
                          {u.gender && <span style={{ fontSize: 9, fontWeight: 700, background: u.gender === 'Female' ? '#FCE7F3' : '#E0E7FF', color: u.gender === 'Female' ? '#BE185D' : '#3730A3', padding: '1px 5px', borderRadius: 4 }}>{u.gender}</span>}
                          {u.ageGroup && <span style={{ fontSize: 9, fontWeight: 700, background: '#F3F4F6', color: '#4B5563', padding: '1px 5px', borderRadius: 4 }}>{u.ageGroup}</span>}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>LTV</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#F97316' }}>₹{u.totalSpent || 0}</p>
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

export default Segments;
