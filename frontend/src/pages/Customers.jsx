import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RiskScatterPlot from './RiskScatterPlot';

/* ── tiny icons ── */
const IconSearch    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconX         = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSparkles  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l1.5 6H20l-5.5 4 2 6L12 14.5 7.5 18l2-6L4 8h6.5L12 2z"/></svg>;
const IconShield    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconCart      = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IconTrend     = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

/* ── Churn badge ── */
const ChurnBadge = ({ score, reasoning }) => {
  if (score === undefined || score === null)
    return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Evaluating…</span>;

  let bg = '#DCFCE7', color = '#16A34A', label = 'Low Risk';
  if (score > 75)      { bg = '#FEE2E2'; color = '#DC2626'; label = 'High Risk'; }
  else if (score >= 40) { bg = '#FFF7ED'; color = '#D97706'; label = 'Medium Risk'; }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className="churn-badge-wrap">
      <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
        {label}
      </span>
      <div className="churn-tooltip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
          <IconSparkles /> <span style={{ fontWeight: 700, color: 'var(--bg-card)' }}>Score: {score}/100</span>
        </div>
        <p style={{ color: '#D1D5DB', lineHeight: 1.5 }}>
          {reasoning || "Algorithmic analysis pending."}
        </p>
      </div>
    </div>
  );
};

/* ── Customer Insights Drawer ── */
const CustomerInsightsDrawer = ({ customerId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    axios.get(`https://crm-native-ai-1.onrender.com/api/ai/explain-customer/${customerId}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customerId]);

  if (!customerId) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: 420, background: 'var(--bg-card)', height: '100%',
        boxShadow: '-8px 0 40px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column',
        padding: '24px', zIndex: 10, overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconSparkles />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>AI Deep-Profile</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <IconX />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: 'var(--text-muted)' }}>
            <span style={{ width: 28, height: 28, border: '3px solid var(--border-light)', borderTopColor: '#F97316', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }}/>
            <span style={{ fontSize: 12 }}>Running behavior metrics extraction…</span>
          </div>
        ) : data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{data.customer.name}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{data.customer.email}</p>
            </div>

            {/* Churn Risk Bar */}
            <div style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-ghost)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><IconShield /> Algorithmic Flight Risk</span>
                <span style={{ color: data.customer.churnRiskScore >= 50 ? '#DC2626' : '#16A34A' }}>{data.customer.churnRiskScore}%</span>
              </div>
              <div style={{ background: '#E5E7EB', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 6, transition: 'width 1s ease',
                  width: `${data.customer.churnRiskScore}%`,
                  background: data.customer.churnRiskScore >= 70 ? '#EF4444' : data.customer.churnRiskScore >= 45 ? '#F97316' : '#22C55E'
                }}/>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>"{data.insights.riskAssessment}"</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: <IconCart />, label: 'Total Revenue', val: `₹${data.customer.totalSpent.toLocaleString()}` },
                { icon: <IconTrend />, label: 'Total Frequency', val: `${data.customer.visits} Purchases` },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ color: '#F97316', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{s.icon}</div>
                  <p style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Behavioral bullets */}
            <div>
              <h5 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>Linguistic Diagnostic Trace</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {data.insights.behavioralBullets?.map((b, i) => (
                  <li key={i} style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--text-ghost)', lineHeight: 1.5 }}>
                    <span style={{ color: '#F97316', marginRight: 6 }}>•</span>{b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Next action */}
            <div style={{ background: 'linear-gradient(135deg, #0F0F0F, #1A1230)', borderRadius: 12, padding: '16px' }}>
              <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(249,115,22,.25)', color: '#FB923C', padding: '2px 8px', borderRadius: 12, letterSpacing: '.6px', textTransform: 'uppercase' }}>
                Strategic Intervention
              </span>
              <p style={{ fontSize: 12, color: '#D1D5DB', marginTop: 8, lineHeight: 1.6 }}>
                {data.insights.nextBestAction}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const IconUpload    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconUserPlus  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;

/* ── Add Customer Modal ── */
const AddCustomerModal = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manual Form State
  const [form, setForm] = useState({ name: '', email: '', totalSpent: '', visits: '', lastOrderDate: '', gender: '', ageGroup: '', country: '', state: '' });

  // File Upload State
  const [file, setFile] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const payload = {
        ...form,
        totalSpent: Number(form.totalSpent) || 0,
        visits: Number(form.visits) || 0,
      };
      await axios.post('https://crm-native-ai-1.onrender.com/api/customers', payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a CSV file'); return; }
    setLoading(true); setError(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        // Simple CSV parser
        const stripQuotes = (str) => str.replace(/^["']|["']$/g, '');
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);
        if (rows.length < 2) throw new Error('CSV must contain headers and at least one row');
        
        const headers = rows[0].split(',').map(h => stripQuotes(h.trim()).toLowerCase());
        const customers = [];

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',').map(c => stripQuotes(c.trim()));
          const getCol = (possibleNames) => {
            const idx = headers.findIndex(h => possibleNames.some(p => h.includes(p)));
            return idx >= 0 ? cols[idx] : null;
          };

          const name = getCol(['name', 'fullname', 'first']);
          const email = getCol(['email']);
          if (!name || !email) continue; // Skip invalid rows

          customers.push({
            name, email,
            totalSpent: Number(getCol(['spent', 'total', 'revenue', 'ltv', 'price'])) || 0,
            visits: Number(getCol(['visit', 'order', 'frequency', 'count'])) || 0,
            lastOrderDate: getCol(['last', 'date', 'order']) || new Date(),
            gender: getCol(['gender', 'sex']),
            ageGroup: getCol(['age'])
          });
        }

        if (customers.length === 0) throw new Error('No valid customers found in CSV (make sure Name and Email columns exist)');

        await axios.post('https://crm-native-ai-1.onrender.com/api/customers/bulk', { customers });
        onSuccess();
      } catch (err) {
        setError(err.message || 'Failed to parse and upload CSV');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => { setError('Failed to read file'); setLoading(false); };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div className="xn-card" style={{ position: 'relative', width: 500, padding: 24, zIndex: 10, animation: 'fadeUp .2s ease both' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><IconUserPlus/> Add Customers</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><IconX /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
          <button onClick={() => setTab('manual')} style={{ background: tab === 'manual' ? '#F97316' : 'transparent', color: tab === 'manual' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Manual Entry
          </button>
          <button onClick={() => setTab('csv')} style={{ background: tab === 'csv' ? '#F97316' : 'transparent', color: tab === 'csv' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            CSV Upload
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {tab === 'manual' ? (
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <input type="text" placeholder="Full Name *" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="xn-input" />
              <input type="email" placeholder="Email Address *" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="xn-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <input type="number" placeholder="Total Spent (₹)" value={form.totalSpent} onChange={e=>setForm({...form, totalSpent: e.target.value})} className="xn-input" />
              <input type="number" placeholder="Total Visits" value={form.visits} onChange={e=>setForm({...form, visits: e.target.value})} className="xn-input" />
            </div>
            <input type="date" placeholder="Last Order Date" value={form.lastOrderDate} onChange={e=>setForm({...form, lastOrderDate: e.target.value})} className="xn-input" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <select value={form.gender} onChange={e=>setForm({...form, gender: e.target.value})} className="xn-input">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select value={form.ageGroup} onChange={e=>setForm({...form, ageGroup: e.target.value})} className="xn-input">
                <option value="">Select Age Group</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55+">55+</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <input type="text" placeholder="Country" value={form.country} onChange={e=>setForm({...form, country: e.target.value})} className="xn-input" />
              <input type="text" placeholder="State/Region" value={form.state} onChange={e=>setForm({...form, state: e.target.value})} className="xn-input" />
            </div>
            <button type="submit" disabled={loading} className="xn-btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-ghost)', border: '1px dashed var(--border-light)', borderRadius: 12, padding: 32, textAlign: 'center' }}>
              <IconUpload />
              <p style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600, marginTop: 12 }}>Select a CSV file to upload</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Required headers: Name, Email</p>
              <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} style={{ marginTop: 16, fontSize: 12 }} />
            </div>
            <button type="submit" disabled={loading || !file} className="xn-btn-primary" style={{ justifyContent: 'center' }}>
              {loading ? 'Uploading...' : 'Process CSV'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const isSeeding = React.useRef(false);

  const fetchCustomers = () => {
    if (isSeeding.current) return; // Don't overwrite seed result
    setIsLoading(true);
    axios.get(`https://crm-native-ai-1.onrender.com/api/customers?_t=${Date.now()}`)
      .then(res => {
        if (!isSeeding.current) setCustomers(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (!isSeeding.current) setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        .churn-badge-wrap { cursor: help; }
        .churn-tooltip {
          display: none;
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          background: #111827;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 11px;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,.25);
        }
        .churn-badge-wrap:hover .churn-tooltip { display: block; }
      `}</style>

      <div className="xn-app-layout">
        <Sidebar />
        <main className="xn-page-content">

          {/* Header */}
          <div className="xn-page-header">
            <div>
              <h1 className="xn-page-title">Customer Database</h1>
              <p className="xn-page-sub">View and manage your CRM contacts with AI churn intelligence</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search customers…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="xn-input"
                  style={{ paddingLeft: 34, width: 240 }}
                />
              </div>
              <button className="xn-btn-ghost" disabled={isLoading} onClick={async () => {
                if (window.confirm("Are you sure you want to delete all customers?")) {
                  setIsLoading(true);
                  try {
                    await axios.delete('https://crm-native-ai-1.onrender.com/api/customers/clear');
                    setCustomers([]);
                  } catch(err) {
                    console.error('Clear failed', err);
                  } finally {
                    setIsLoading(false);
                  }
                }
              }} style={{ color: '#EF4444' }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear Data
              </button>
              <button className="xn-btn-ghost" disabled={isLoading} onClick={async () => {
                isSeeding.current = true;
                setIsLoading(true);
                setCustomers([]);
                try {
                  const res = await axios.post('https://crm-native-ai-1.onrender.com/api/customers/seed');
                  const data = Array.isArray(res.data) ? res.data : [];
                  setCustomers(data);
                  setIsLoading(false);
                } catch (err) {
                  console.error('Seed failed:', err);
                  setIsLoading(false);
                } finally {
                  isSeeding.current = false;
                }
              }}>
                <IconSparkles /> Seed Dummy Data
              </button>
              <button className="xn-btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <IconUserPlus /> Add Customer
              </button>
            </div>
          </div>

          {/* Scatter Plot */}
          {!isLoading && customers.length > 0 && (
            <div className="xn-card" style={{ marginBottom: 20 }}>
              <RiskScatterPlot customers={customers} />
            </div>
          )}

          {/* Table */}
          <div className="xn-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="xn-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Total Spent</th>
                  <th style={{ textAlign: 'right' }}>Visits</th>
                  <th>Demographics</th>
                  <th>Location</th>
                  <th>Last Order</th>
                  <th>Churn Risk</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading customers…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No customers found.</td></tr>
                ) : (
                  filtered.map(c => (
                    <tr key={c._id} onClick={() => setSelectedCustomerId(c._id)}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</td>
                      <td style={{ color: '#6B7280' }}>{c.email}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>₹{c.totalSpent.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-ghost)' }}>{c.visits}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {c.gender && (
                            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: c.gender === 'Female' ? '#FCE7F3' : '#E0E7FF', color: c.gender === 'Female' ? '#BE185D' : '#3730A3' }}>
                              {c.gender}
                            </span>
                          )}
                          {c.ageGroup && (
                            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#F3F4F6', color: '#4B5563' }}>
                              {c.ageGroup}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-main)' }}>
                        {c.state && c.country ? `${c.state}, ${c.country}` : c.country || c.state || <span style={{color: 'var(--text-muted)'}}>N/A</span>}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <ChurnBadge score={c.churnRiskScore} reasoning={c.churnReasoning} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <CustomerInsightsDrawer customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
      
      {isAddModalOpen && (
        <AddCustomerModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchCustomers();
          }} 
        />
      )}
    </>
  );
};

export default Customers;
