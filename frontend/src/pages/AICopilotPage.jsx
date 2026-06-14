import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const IconSend = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconBrain = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v0a2 2 0 002 2h.5A2.5 2.5 0 017 13.5v0A2.5 2.5 0 019.5 16H10"/><path d="M14.5 2A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0119.5 7H20a2 2 0 012 2v0a2 2 0 01-2 2h-.5A2.5 2.5 0 0117 13.5v0A2.5 2.5 0 0114.5 16H14"/><path d="M12 16v6M9 22h6"/><circle cx="12" cy="12" r="3"/></svg>;
const IconUser  = () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>;
const IconRocket = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>;

const QUICK_PROMPTS = [
  'Draft a campaign for Female customers Age 25-34',
  'Suggest a win-back campaign for inactive users',
  'Plan a Diwali mega-sale campaign',
  'Create a Christmas promotional email',
  'Draft a Black Friday exclusive offer',
  'What channel has the best open rates?',
  'Which customers should I target for upsell?',
];

export default function AICopilotPage() {
  const navigate = useNavigate();

  // ── Per-user session storage key ──────────────────────────────────────────
  const userId = localStorage.getItem('userId') || 'guest';
  const SESSION_KEY = `ai_sessions_${userId}`;

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState(
    sessions.length > 0 ? sessions[0].id : null
  );

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!activeSessionId) {
      const newId = Date.now();
      setSessions([{
        id: newId, title: 'New Chat',
        messages: [{
          id: 1, sender: 'ai',
          text: "Hi! I'm your XenoReach AI Copilot 🤖\n\nI've analyzed your system telemetry and I'm ready to help you craft smarter campaigns, understand your customers, and maximize revenue. I can now automatically tailor campaigns specifically by Gender, Age Group, and seasonal occasions!\n\nTry asking me anything about your CRM data!",
          time: new Date().toLocaleTimeString()
        }]
      }, ...sessions]);
      setActiveSessionId(newId);
    }
  }, [activeSessionId, sessions]);

  // Persist sessions under this user's key only
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, isTyping]);

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const updateActiveSessionMessages = (newMessages, titleUpdate = null) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: newMessages, title: titleUpdate || s.title };
      }
      return s;
    }));
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');

    const userMsg = { id: Date.now(), sender: 'user', text: userText, time: new Date().toLocaleTimeString() };
    const newMessages = [...messages, userMsg];
    
    // Auto-generate title for new sessions
    let newTitle = activeSession?.title;
    if (messages.length <= 1) {
      newTitle = userText.length > 20 ? userText.substring(0, 20) + '...' : userText;
    }

    updateActiveSessionMessages(newMessages, newTitle);
    setIsTyping(true);

    try {
      const settings = JSON.parse(localStorage.getItem('xeno_settings') || '{}');
      const res = await axios.post('https://crm-native-ai-1.onrender.com/api/ai/chat', {
        message: userText,
        history: newMessages,
        aiModel: settings.aiModel || 'llama-3.1-8b-instant',
        temperature: settings.temperature !== undefined ? parseFloat(settings.temperature) : 0.5
      });
      updateActiveSessionMessages([...newMessages, {
        id: Date.now() + 1, sender: 'ai',
        text: res.data.reply,
        time: new Date().toLocaleTimeString()
      }]);
    } catch {
      updateActiveSessionMessages([...newMessages, {
        id: Date.now() + 1, sender: 'ai',
        text: "I'm having trouble connecting to the strategy database. Please make sure the backend is running.",
        time: new Date().toLocaleTimeString()
      }]);
    } finally { setIsTyping(false); }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  return (
    <div className="xn-app-layout">
      <Sidebar />
      <main className="xn-page-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="xn-page-header" style={{ marginBottom: 16 }}>
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ color: '#A78BFA' }}><IconBrain /></span> AI Copilot
            </h1>
            <p className="xn-page-sub">Your intelligent marketing consultant powered by Groq LLaMA</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(167,139,250,.1)', border: '1.5px solid rgba(167,139,250,.3)', color: '#A78BFA', fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: 'sbPulse 1.5s infinite' }} />
            AI Online · LLaMA 3.1
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: 16, flex: 1, minHeight: 0 }}>
          
          {/* History Sidebar */}
          <div className="xn-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', height: 'calc(100vh - 180px)', background: 'var(--bg-ghost)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <button onClick={handleNewChat} className="xn-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                + New Chat
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', padding: '4px 8px', marginBottom: 4 }}>Past Sessions</div>
              {sessions.map(s => (
                <button key={s.id} onClick={() => setActiveSessionId(s.id)}
                  style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: s.id === activeSessionId ? 'var(--border-light)' : 'transparent',
                    color: s.id === activeSessionId ? 'var(--text-main)' : 'var(--text-ghost)',
                    fontSize: 12, fontWeight: s.id === activeSessionId ? 600 : 500, fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'background .2s'
                  }}>
                  💬 {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Chat column */}
          <div className="xn-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', height: 'calc(100vh - 180px)' }}>
            {/* Chat header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBrain />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>XenoReach Copilot</div>
                <div style={{ fontSize: 10.5, color: '#22C55E', fontWeight: 600 }}>● Online — ready to assist</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg-ghost)' }}>
              {messages.map(msg => {
                const launchMatch = msg.text.match(/\[LAUNCH_CAMPAIGN:\s*(.*?)\]/);
                const displayMsg = msg.text.replace(/\[LAUNCH_CAMPAIGN:\s*.*?\]/, '').trim();
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                    {msg.sender === 'ai' && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <svg width="12" height="12" fill='var(--bg-card)' viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>
                      </div>
                    )}
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{
                        background: msg.sender === 'user' ? '#4F46E5' : 'var(--bg-card)',
                        color: msg.sender === 'user' ? 'var(--bg-card)' : 'var(--text-main)',
                        padding: '10px 14px', borderRadius: msg.sender === 'user' ? '14px 14px 0 14px' : '0 14px 14px 14px',
                        fontSize: 13.5, lineHeight: 1.6,
                        border: msg.sender === 'ai' ? '1px solid var(--border-light)' : 'none',
                        boxShadow: '0 1px 4px rgba(0,0,0,.05)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {displayMsg}
                        {launchMatch && (
                          <div style={{ marginTop: 12, borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
                            <button
                              onClick={() => navigate('/agent', { state: { 
                                prefillAudience: launchMatch[1],
                                prefillPrompt: displayMsg 
                              } })}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px',
                                background: '#4F46E5', color: 'var(--bg-card)', border: 'none', borderRadius: 8,
                                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                boxShadow: '0 4px 12px rgba(79,70,229,.25)', transition: 'all .2s'
                              }}
                            >
                              <IconRocket />
                              Launch Campaign for "{launchMatch[1]}"
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 3, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                    </div>
                    {msg.sender === 'user' && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <IconUser />
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" fill='var(--bg-card)' viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '12px 16px', borderRadius: '0 14px 14px 14px', display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `sbPulse 1.2s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8, background: 'var(--bg-card)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about campaigns, segments, churn risks…"
                disabled={isTyping}
                className="xn-input"
                style={{ flex: 1, fontSize: 13 }}
              />
              <button type="submit" disabled={!input.trim() || isTyping} className="xn-btn-primary" style={{ padding: '9px 14px', background: '#7C3AED', boxShadow: 'none' }}>
                <IconSend />
              </button>
            </form>
          </div>

          {/* Right panel — quick prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="xn-card">
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Quick Prompts</h3>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: '1.5px solid var(--border-light)',
                    borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'var(--text-ghost)', cursor: 'pointer',
                    marginBottom: 6, lineHeight: 1.4, fontFamily: 'Inter, sans-serif', transition: 'all .15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#A78BFA'; e.currentTarget.style.color = '#7C3AED'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-ghost)'; }}
                >
                  💡 {p}
                </button>
              ))}
            </div>

            <div className="xn-card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,.08), rgba(167,139,250,.05))', border: '1px solid rgba(124,58,237,.15)' }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>AI Capabilities</h3>
              {[
                '🎯 Campaign strategy advice',
                '👥 Demographic personalization (Age/Gender)',
                '📊 Churn risk analysis',
                '📱 Channel recommendations',
                '🔄 Retention tactics',
              ].map((cap, i) => (
                <p key={i} style={{ fontSize: 11.5, color: 'var(--text-ghost)', marginBottom: 5, lineHeight: 1.4 }}>{cap}</p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
