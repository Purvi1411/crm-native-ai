import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

/* ── Icons ── */
const IconCalendar = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconZap      = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconInfo     = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

const YEAR = new Date().getFullYear();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const OCCASIONS = [
  // January
  { id: 1, month: 0, date: 1, title: "New Year's Day", desc: 'Kick off the year with fresh promotions and resolutions.', color: '#3B82F6' },
  { id: 2, month: 0, date: 14, title: 'Makar Sankranti / Pongal', desc: 'Harvest festival greetings and festive discounts.', color: '#EAB308' },
  { id: 3, month: 0, date: 26, title: 'Republic Day', desc: 'National pride campaigns and patriotic sales.', color: '#4F46E5' },
  
  // February
  { id: 4, month: 1, date: 14, title: "Valentine's Day", desc: 'Couples, gifting, and love-themed marketing pushes.', color: '#EC4899' },
  { id: 5, month: 1, date: 28, title: 'National Science Day', desc: 'Tech sales, STEM promotions, and innovation themes.', color: '#8B5CF6' },
  
  // March
  { id: 6, month: 2, date: 8, title: "International Women's Day", desc: 'Empowerment campaigns and special offers for female demographics.', color: '#D946EF' },
  { id: 7, month: 2, date: 17, title: "St. Patrick's Day", desc: 'Green-themed sales, luck-based discounts.', color: '#10B981' },
  { id: 8, month: 2, date: 20, title: 'International Day of Happiness', desc: 'Feel-good marketing and community appreciation.', color: '#FCD34D' },
  { id: 9, month: 2, date: 23, title: 'Holi', desc: 'Festival of colors! Vibrant marketing and massive festive sales.', color: '#F43F5E' },
  
  // April
  { id: 10, month: 3, date: 1, title: "April Fool's Day", desc: 'Playful marketing, joke campaigns, and surprise reveals.', color: '#F59E0B' },
  { id: 11, month: 3, date: 7, title: 'World Health Day', desc: 'Wellness products, fitness deals, and health-conscious messaging.', color: '#14B8A6' },
  { id: 12, month: 3, date: 14, title: 'Baisakhi / Ambedkar Jayanti', desc: 'Spring harvest celebrations and localized community offers.', color: '#EAB308' },
  { id: 13, month: 3, date: 22, title: 'Earth Day', desc: 'Eco-friendly product pushes and sustainability awareness.', color: '#22C55E' },
  
  // May
  { id: 14, month: 4, date: 1, title: 'Labour Day / May Day', desc: 'Worker appreciation and long-weekend sales.', color: '#DC2626' },
  { id: 15, month: 4, date: 4, title: 'Star Wars Day (May the 4th)', desc: 'Geek culture, sci-fi sales, and fun pop-culture marketing.', color: '#6B7280' },
  { id: 16, month: 4, date: 10, title: "Mother's Day", desc: 'Celebrate moms with heartfelt messages and exclusive discounts.', color: '#F43F5E' },
  
  // June
  { id: 17, month: 5, date: 5, title: 'World Environment Day', desc: 'Green campaigns, zero-waste promotions.', color: '#16A34A' },
  { id: 18, month: 5, date: 21, title: 'Summer Solstice Sale & Yoga Day', desc: 'Celebrate the start of summer with massive warm-weather discounts.', color: '#0EA5E9' },
  { id: 19, month: 5, date: 30, title: 'World Social Media Day', desc: 'Engage followers, viral campaigns, and digital-only offers.', color: '#3B82F6' },
  
  // July
  { id: 20, month: 6, date: 1, title: "National Doctor's Day", desc: 'Healthcare appreciation and frontline worker discounts.', color: '#06B6D4' },
  { id: 21, month: 6, date: 17, title: 'World Emoji Day', desc: 'Fun, highly visual, and highly interactive social campaigns.', color: '#FACC15' },
  { id: 22, month: 6, date: 30, title: 'International Friendship Day', desc: 'Refer-a-friend bonuses and BOGO (Buy One Get One) deals.', color: '#F472B6' },
  
  // August
  { id: 41, month: 7, date: 1, title: 'Back to School', desc: 'Early bird student offers, electronics, and apparel sales.', color: '#EAB308' },
  { id: 23, month: 7, date: 12, title: 'International Youth Day', desc: 'Gen-Z targeted campaigns and student discounts.', color: '#8B5CF6' },
  { id: 24, month: 7, date: 15, title: 'Independence Day', desc: 'Freedom sales and nation-wide celebratory offers.', color: '#4F46E5' },
  { id: 25, month: 7, date: 19, title: 'World Photography Day', desc: 'Visual contests, UGC campaigns, and creative marketing.', color: '#64748B' },
  { id: 26, month: 7, date: 28, title: 'Raksha Bandhan', desc: 'Sibling gifting, emotional campaigns, and bundle offers.', color: '#10B981' },
  
  // September
  { id: 27, month: 8, date: 5, title: "Teachers' Day", desc: 'Educational discounts and mentorship appreciation.', color: '#EAB308' },
  { id: 28, month: 8, date: 27, title: 'World Tourism Day', desc: 'Travel deals, luggage sales, and experience-based marketing.', color: '#0284C7' },
  
  // October
  { id: 29, month: 9, date: 2, title: 'Gandhi Jayanti', desc: 'Khadi sales, peace messages, and localized offers.', color: '#4F46E5' },
  { id: 30, month: 9, date: 10, title: 'World Mental Health Day', desc: 'Self-care promotions and empathetic brand messaging.', color: '#14B8A6' },
  { id: 31, month: 9, date: 24, title: 'Dussehra', desc: 'Victory of good over evil. Massive festive shopping push.', color: '#EF4444' },
  { id: 32, month: 9, date: 31, title: 'Halloween', desc: 'Spooky discounts, costume contests, and creative engaging marketing.', color: '#4338CA' },
  
  // November
  { id: 33, month: 10, date: 8, title: 'Diwali', desc: 'The biggest festive shopping season. Maximize volume and ad spend.', color: '#EAB308' },
  { id: 34, month: 10, date: 11, title: "Singles' Day (11.11)", desc: 'Global mega-sale event. High discounts and massive traffic.', color: '#EF4444' },
  { id: 35, month: 10, date: 14, title: "Children's Day", desc: 'Kids apparel, toy sales, and family-oriented campaigns.', color: '#3B82F6' },
  { id: 36, month: 10, date: 19, title: "International Men's Day", desc: 'Menswear, grooming products, and male demographic offers.', color: '#4F46E5' },
  { id: 42, month: 10, date: 26, title: 'Thanksgiving', desc: 'Pre-Black Friday gratitude offers and family-focused promotions.', color: '#F59E0B' },
  { id: 37, month: 10, date: 27, title: 'Black Friday', desc: 'Unbeatable deals and high-urgency flash sales. Peak conversion.', color: '#111827' },
  { id: 38, month: 10, date: 30, title: 'Cyber Monday', desc: 'Tech sales, software deals, and extended Black Friday offers.', color: '#3B82F6' },
  
  // December
  { id: 39, month: 11, date: 25, title: 'Christmas', desc: 'End-of-year festive cheer, holiday gifting, and winter sales.', color: '#10B981' },
  { id: 40, month: 11, date: 31, title: "New Year's Eve", desc: 'Last-minute sales, party prep, and end-of-year wrap-ups.', color: '#8B5CF6' }
];

export default function OccasionsCalendar() {
  const navigate = useNavigate();
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]); // Default to first

  const handleLaunchCampaign = () => {
    if (!selectedOccasion) return;
    navigate('/agent', { 
      state: { prefillPrompt: `Run an elite promotional campaign for ${selectedOccasion.title}` } 
    });
  };

  // Pre-compute calendar grid for 12 months
  const calendarGrid = useMemo(() => {
    return MONTHS.map((monthName, mIndex) => {
      const daysInMonth = new Date(YEAR, mIndex + 1, 0).getDate();
      const firstDayOfWeek = new Date(YEAR, mIndex, 1).getDay();
      
      const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => null);
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      
      return { monthName, mIndex, grid: [...blanks, ...days] };
    });
  }, []);

  const getOccasionForDate = (mIndex, day) => {
    if (!day) return null;
    return OCCASIONS.find(o => o.month === mIndex && o.date === day);
  };

  return (
    <div className="xn-app-layout">
      <Sidebar />

      <main className="xn-page-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="xn-page-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="xn-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#EC4899' }}>
              <IconCalendar /> {YEAR} Marketing Calendar
            </h1>
            <p className="xn-page-sub">View the entire year at a glance. Select any highlighted date to launch a targeted campaign.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Calendar Grid Section */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {calendarGrid.map((month) => (
              <div key={month.monthName} className="xn-card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {month.monthName}
                </h3>
                
                {/* Weekday headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {WEEKDAYS.map(day => (
                    <div key={day} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {month.grid.map((day, idx) => {
                    const occasion = getOccasionForDate(month.mIndex, day);
                    const isSelected = selectedOccasion && occasion && selectedOccasion.id === occasion.id;
                    
                    return (
                      <div 
                        key={idx}
                        onClick={() => occasion && setSelectedOccasion(occasion)}
                        style={{ 
                          aspectRatio: '1 / 1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: occasion ? 800 : 500,
                          color: occasion ? '#FFF' : (day ? 'var(--text-ghost)' : 'transparent'),
                          background: occasion ? (isSelected ? occasion.color : `${occasion.color}80`) : 'transparent',
                          border: isSelected ? `2px solid #FFF` : occasion ? `2px solid transparent` : 'none',
                          borderRadius: '50%',
                          cursor: occasion ? 'pointer' : 'default',
                          opacity: day ? 1 : 0,
                          boxShadow: isSelected ? `0 0 10px ${occasion.color}80` : 'none',
                          transform: isSelected ? 'scale(1.15)' : 'none',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        title={occasion ? occasion.title : ''}
                      >
                        {day || ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Panel (Sticky on the right) */}
          <div style={{ width: 340, position: 'sticky', top: 24, flexShrink: 0 }}>
            {selectedOccasion ? (
              <div className="xn-card" style={{ borderTop: `4px solid ${selectedOccasion.color}`, boxShadow: '0 20px 40px rgba(0,0,0,.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <IconCalendar />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {MONTHS[selectedOccasion.month]} {selectedOccasion.date}, {YEAR}
                  </span>
                </div>
                
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                  {selectedOccasion.title}
                </h2>
                
                <p style={{ fontSize: 14, color: 'var(--text-ghost)', lineHeight: 1.6, marginBottom: 24 }}>
                  {selectedOccasion.desc}
                </p>
                
                <div style={{ background: 'var(--bg-ghost)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10 }}>
                  <span style={{ color: selectedOccasion.color, marginTop: 2 }}><IconInfo /></span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Click the button below to initialize the AI Campaign Agent. It will automatically build an audience and draft messaging tailored for this holiday.
                  </p>
                </div>

                <button 
                  onClick={handleLaunchCampaign}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10,
                    background: selectedOccasion.color,
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 800, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer',
                    boxShadow: `0 8px 24px ${selectedOccasion.color}40`,
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <IconZap /> 
                  Generate Campaign
                </button>
              </div>
            ) : (
              <div className="xn-card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <IconCalendar />
                <p style={{ marginTop: 12, fontSize: 14 }}>Select a highlighted date on the calendar to view details and launch a campaign.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
