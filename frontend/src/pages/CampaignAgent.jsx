import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

/* ── icons ── */
const IconSend    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconZap     = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconWand    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5"/></svg>;
const IconFilter  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconArrow   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconTarget  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconMsg     = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconLoader  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: 'spin .7s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>;

const CampaignAgent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prefilledAudience] = useState(location.state?.prefillAudience || '');
  const [prefilledCriteria] = useState(location.state?.prefillCriteria || '');
  const [prefillSegmentId] = useState(location.state?.prefillSegmentId || null);
  const [prompt, setPrompt] = useState(location.state?.prefillPrompt || '');
  const [brandVoice, setBrandVoice] = useState('');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing...');

  useEffect(() => {
    let interval;
    if (isLoading) {
      const texts = [
        'Connecting to AI Copilot...',
        'Building Audience DNA...',
        'Drafting message copy...',
        'Running safety checks...',
        'Optimizing channel delivery...',
        'Finalizing AI strategy...'
      ];
      let i = 0;
      setLoadingText(texts[0]);
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 1800);
    } else {
      setLoadingText('Analyzing...');
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-trigger generation if coming from a recommendation or calendar
  const hasAutoTriggered = useRef(false);
  useEffect(() => {
    if ((prefilledAudience || location.state?.prefillPrompt) && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      generatePlanFor(location.state?.prefillPrompt || '');
    }
  }, [prefilledAudience, location.state]);

  const generatePlanFor = async (customPrompt) => {
    let finalPrompt = customPrompt;
    if (prefilledAudience) {
      const criteriaText = prefilledCriteria ? ` The target demographic criteria is: ${prefilledCriteria}.` : '';
      if (finalPrompt) {
        finalPrompt = `${finalPrompt}. CRITICAL: You must specifically tailor this campaign and its message to target our '${prefilledAudience}' segment.${criteriaText}`;
      } else {
        finalPrompt = `Run an elite promotional campaign targeting our ${prefilledAudience} segment.${criteriaText}`;
      }
    } else {
      if (!finalPrompt) {
        finalPrompt = 'Run an elite general promotional campaign to engage all customers';
      }
    }
    setIsLoading(true);
    try {
      const settings = JSON.parse(localStorage.getItem('xeno_settings') || '{}');
      const res = await axios.post('https://crm-native-ai-1.onrender.com/api/ai/plan', { 
        prompt: finalPrompt, 
        brandVoice,
        aiModel: settings.aiModel,
        temperature: settings.temperature ? parseFloat(settings.temperature) : 0.5,
        brandSafety: settings.brandSafety,
        segmentId: prefillSegmentId
      });
      setPlan(res.data);
    } catch (err) {
      alert(`Error: ${err?.response?.data?.error || err?.message || 'Failed to generate plan'}`);
    } finally { setIsLoading(false); }
  };

  const handleGeneratePlan = (e) => {
    e.preventDefault();
    generatePlanFor(prompt);
  };

  const handleLaunchCampaign = async () => {
    setIsLaunching(true);
    try {
      await axios.post('https://crm-native-ai-1.onrender.com/api/campaigns', {
        name: plan.campaignName || plan.objective || 'AI Autonomous Campaign',
        objective: plan.objective,
        message: plan.message,
        channel: plan.channel || 'email',
        audience: prefilledAudience || plan.dna?.audience || 'Dynamic AI Segment',
        targetCount: plan.audienceCount || 0,
        dbQuery: plan.dbQuery
      });
      navigate('/campaigns');
    } catch { alert('Failed to launch campaign.'); }
    finally { setIsLaunching(false); }
  };

  return (
    <div className="xn-app-layout">
      <Sidebar />

      <main className="xn-page-content">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <IconZap /> Campaign Copilot
            </h1>
            <p className="xn-page-sub">Describe your goal and AI will build the audience, craft the message, and dispatch the campaign.</p>
          </div>

          {/* Brand Voice accordion */}
          <div className="xn-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setIsVoiceOpen(!isVoiceOpen)}
              style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--text-ghost)' }}>
                <IconWand /> Train AI Brand Voice <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isVoiceOpen ? '▲ Hide' : '▼ Expand'}</span>
            </button>
            {isVoiceOpen && (
              <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border-light)', background: '#FAFAFA' }}>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10, marginTop: 12, lineHeight: 1.6 }}>
                  Paste a past successful email or caption. The AI will analyze and mimic this exact writing style.
                </p>
                <textarea
                  value={brandVoice}
                  onChange={e => setBrandVoice(e.target.value)}
                  placeholder="e.g., 'Hey bestie! ✨ Dropping into your inbox with the craziest deal of the year...'"
                  className="xn-input"
                  style={{ width: '100%', height: 90, resize: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Locked audience badge */}
          {prefilledAudience && (
            <div style={{ background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#C2410C' }}>
              <IconTarget /> Locked Audience: <span style={{ textTransform: 'uppercase', letterSpacing: '.5px' }}>{prefilledAudience}</span>
            </div>
          )}

          {/* Prompt form */}
          <div className="xn-card" style={{ padding: '6px 8px', marginBottom: 24 }}>
            <form onSubmit={handleGeneratePlan} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe your audience goal, or leave blank for a general campaign…"
                style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', fontSize: 13.5, color: 'var(--text-main)', background: 'transparent', fontFamily: 'Inter, sans-serif' }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="xn-btn-primary"
                style={{ padding: '10px 16px' }}
              >
                {isLoading ? <IconLoader /> : <IconSend />}
                {isLoading ? loadingText : 'Generate Plan'}
              </button>
            </form>
          </div>

          {/* Plan Results */}
          {plan && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Channel badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <IconZap /> {plan.campaignName || 'AI Strategy Engine Engaged'}
                </h3>
                <span className="xn-badge-pill xn-badge-orange" style={{ textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  Targeting: {plan.channel}
                </span>
              </div>

              {/* Segmentation Pipeline */}
              <div className="xn-card xn-fade-up" style={{ background: 'var(--bg-ghost)', animationDelay: '0.1s' }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <IconFilter /> Database Segmentation Flow
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  {[
                    { label: 'CRM Master Base', val: '100% Data' },
                    null,
                    { label: 'Demographic', val: (plan.filters?.genderTarget && plan.filters.genderTarget !== 'All') ? plan.filters.genderTarget : 'All Genders' },
                    null,
                    { label: 'Spend Criteria', val: plan.filters?.minSpend > 0 ? `₹${plan.filters.minSpend}+` : 'Unrestricted' },
                    null,
                    { label: 'Inactivity Gate', val: plan.filters?.inactiveDays ? `${plan.filters.inactiveDays} Days` : 'All Activity' },
                    null,
                  ].map((item, i) =>
                    item === null ? (
                      <span key={i} style={{ color: 'var(--border-light)' }}><IconArrow /></span>
                    ) : (
                      <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '10px 14px', textAlign: 'center', flex: 1 }}>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{item.val}</p>
                      </div>
                    )
                  )}
                  <span style={{ color: 'var(--border-light)' }}><IconArrow /></span>
                  <div style={{ background: '#F97316', borderRadius: 8, padding: '10px 14px', textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>Final Cohort</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--bg-card)' }}>{plan.audienceCount}</p>
                  </div>
                </div>
              </div>

              {/* Timeline + DNA */}
              <div className="xn-grid-responsive xn-fade-up" style={{ animationDelay: '0.2s', gap: 14 }}>
                {/* Timeline */}
                <div className="xn-card" style={{ background: '#0F0F0F', borderRadius: 14, padding: '20px', border: '1px solid rgba(249,115,22,.15)' }}>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
                    AI Agent Trace Logs
                  </h4>
                  {plan.timeline?.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginBottom: 8, lineHeight: 1.5 }}>
                      <span style={{ color: '#22C55E', flexShrink: 0 }}>✓</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#F97316', fontWeight: 700 }}>
                    <span>⚡ Confidence Matrix:</span><span>98.4%</span>
                  </div>
                </div>

                {/* Campaign DNA */}
                <div className="xn-card" style={{ background: 'linear-gradient(135deg, #1E1B4B, #0F0F0F)', borderRadius: 14, padding: '20px', border: '1px solid rgba(99,102,241,.2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -10, bottom: -10, fontSize: 56, opacity: .06, fontWeight: 800, color: 'var(--bg-card)', pointerEvents: 'none' }}>DNA</div>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>🧬 Campaign Architecture DNA</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                    {[
                      { label: 'Intent', val: plan.dna?.objective || plan.objective },
                      { label: 'Cohort Vibe', val: prefilledAudience || plan.dna?.audience || 'Segment Base' },
                      { label: 'Psych Trigger', val: plan.dna?.emotion || 'Value', color: '#FCD34D' },
                      { label: 'Feasibility', val: plan.dna?.predictedSuccess || 'Optimal', color: '#6EE7B7' },
                    ].map(d => (
                      <div key={d.label} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '8px 10px' }}>
                        <p style={{ fontSize: 9.5, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>{d.label}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: d.color || 'var(--bg-card)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Channel Matrix + Simulator */}
              <div className="xn-grid-responsive xn-fade-up" style={{ animationDelay: '0.3s', gap: 14 }}>
                {/* Channel Matrix */}
                <div className="xn-card">
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>📱 Omnichannel Confidence Matrix</h4>
                  {plan.channelsMatrix && Object.entries(plan.channelsMatrix).map(([ch, score]) => (
                    <div key={ch} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                        <span style={{ color: 'var(--text-ghost)' }}>{ch}</span>
                        <span style={{ color: plan.channel === ch ? '#F97316' : 'var(--text-muted)' }}>
                          {score}% {plan.channel === ch && '🎯 Recommended'}
                        </span>
                      </div>
                      <div style={{ background: 'var(--border-light)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: plan.channel === ch ? '#F97316' : '#D1D5DB', borderRadius: 4, transition: 'width .5s ease' }}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulator */}
                <div className="xn-card" style={{ background: 'var(--bg-ghost)' }}>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>📊 Campaign Digital Twin Simulator</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Total Targets', val: plan.audienceCount, color: 'var(--text-main)' },
                      { label: 'Expected Opens', val: Math.round(plan.audienceCount * (plan.simulationRatios?.openRate || 0.7)), color: '#FB923C' },
                      { label: 'Expected Clicks', val: Math.round(plan.audienceCount * (plan.simulationRatios?.openRate || 0.7) * (plan.simulationRatios?.clickRate || 0.2)), color: '#8B5CF6' },
                      { label: 'Conversions', val: Math.round(plan.audienceCount * (plan.simulationRatios?.conversionRate || 0.05)), color: '#10B981' },
                      { label: 'Expected Profit', val: `₹${Math.round((plan.audienceCount * (plan.simulationRatios?.conversionRate || 0.05)) * (plan.simulationRatios?.aov || 1500) * (plan.simulationRatios?.profitMargin || 0.2)).toLocaleString()}`, color: '#F59E0B' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 9, padding: '10px 12px' }}>
                        <p style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Objective + Message */}
              <div className="xn-card xn-fade-up" style={{ animationDelay: '0.4s' }}>
                <p style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>Extracted Strategic Objective</p>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 16, fontSize: 14 }}>{plan.objective}</p>

                <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '14px 16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#C7D2FE', color: '#C2410C', fontSize: 9.5, fontWeight: 700, padding: '3px 9px', borderRadius: '0 10px 0 8px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                    Stylized Copy
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#C2410C', marginBottom: 7 }}>
                    <IconMsg /> <span style={{ fontSize: 12, fontWeight: 700 }}>Tailored Message Copy</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#312E81', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 500 }}>"{plan.message}"</p>
                </div>
              </div>

              {/* Launch button */}
              <div className="xn-fade-up" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={handleLaunchCampaign}
                  disabled={isLaunching || plan.audienceCount === 0}
                  className="xn-btn-primary"
                  style={{
                    width: '100%', padding: '16px', border: 'none', borderRadius: 12,
                    background: plan.audienceCount === 0 ? '#E5E7EB' : 'linear-gradient(135deg, #F97316, #EA580C)',
                    color: plan.audienceCount === 0 ? 'var(--text-muted)' : 'var(--bg-card)',
                    fontSize: 15, fontWeight: 700, cursor: plan.audienceCount === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    boxShadow: plan.audienceCount === 0 ? 'none' : '0 8px 24px rgba(249,115,22,.35)',
                    transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {isLaunching ? <IconLoader /> : <IconZap />}
                  {plan.audienceCount === 0 ? 'Cannot Launch: Zero Database Intersects' : 'Dispatch Autonomous Campaign'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CampaignAgent;
