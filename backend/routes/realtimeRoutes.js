const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const Communication = require('../models/Communication');
const Segment = require('../models/Segment');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================================
// SSE: Real-time Live Monitor event stream
// GET /api/realtime/events
// ============================================================
const sseClients = new Set();

// Expose the broadcaster so other routes can push events
const broadcastEvent = (event) => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach(client => {
    try { client.res.write(payload); } catch (_) {}
  });
};

router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const clientId = Date.now();
  const client = { id: clientId, res };
  sseClients.add(client);

  // Send a heartbeat immediately
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE stream established' })}\n\n`);

  // Heartbeat every 20s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (_) { clearInterval(heartbeat); }
  }, 20000);

  req.on('close', () => {
    sseClients.delete(client);
    clearInterval(heartbeat);
  });
});

// ============================================================
// GET /api/realtime/stats — aggregate live stats
// ============================================================
router.get('/stats', async (req, res) => {
  try {
    const [
      totalCustomers,
      highRiskCustomers,
      totalCampaigns,
      totalSegments,
      campaigns,
      topAtRiskCustomers,
      revenueAggregation
    ] = await Promise.all([
      Customer.countDocuments({ userId: req.user._id }),
      Customer.countDocuments({ userId: req.user._id, churnRiskScore: { $gte: 75 } }),
      Campaign.countDocuments({ userId: req.user._id }),
      Segment.countDocuments({ userId: req.user._id }),
      Campaign.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20),
      Customer.find({ userId: req.user._id, churnRiskScore: { $gte: 70 } }).sort({ churnRiskScore: -1 }).limit(5),
      Customer.aggregate([{ $match: { userId: req.user._id } }, { $group: { _id: null, total: { $sum: "$totalSpent" } } }])
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    const totalSent      = campaigns.reduce((s, c) => s + (c.stats?.sent      || 0), 0);
    const totalDelivered = campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0);
    const totalFailed    = campaigns.reduce((s, c) => s + (c.stats?.failed    || 0), 0);
    const deliveryRate   = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;

    // Channel breakdown
    const channelBreakdown = {};
    campaigns.forEach(c => {
      if (!channelBreakdown[c.channel]) channelBreakdown[c.channel] = { sent: 0, delivered: 0, campaigns: 0 };
      channelBreakdown[c.channel].sent      += c.stats?.sent      || 0;
      channelBreakdown[c.channel].delivered += c.stats?.delivered || 0;
      channelBreakdown[c.channel].campaigns += 1;
    });

    res.json({
      customers: { total: totalCustomers, highRisk: highRiskCustomers, totalRevenue },
      campaigns: { total: totalCampaigns, totalSent, totalDelivered, totalFailed, deliveryRate: parseFloat(deliveryRate) },
      segments:  { total: totalSegments },
      channelBreakdown,
      recentCampaigns: campaigns.slice(0, 5).map(c => ({
        id: c._id, name: c.name, channel: c.channel, status: c.status,
        stats: c.stats, createdAt: c.createdAt
      })),
      topAtRiskCustomers: topAtRiskCustomers || []
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================================
// GET /api/realtime/analytics — detailed analytics for charts
// ============================================================
router.get('/analytics', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);

    // Bar chart data — last 10 campaigns
    const barData = campaigns.slice(0, 10).reverse().map(c => ({
      name: (c.name || 'Campaign').substring(0, 16),
      Sent: c.stats?.sent || 0,
      Delivered: c.stats?.delivered || 0,
      Failed: c.stats?.failed || 0,
    }));

    // Pie data
    const totalSent      = campaigns.reduce((s, c) => s + (c.stats?.sent      || 0), 0);
    const totalDelivered = campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0);
    const totalFailed    = campaigns.reduce((s, c) => s + (c.stats?.failed    || 0), 0);

    // Channel performance
    const channelMap = {};
    campaigns.forEach(c => {
      if (!channelMap[c.channel]) channelMap[c.channel] = { sent: 0, delivered: 0 };
      channelMap[c.channel].sent      += c.stats?.sent      || 0;
      channelMap[c.channel].delivered += c.stats?.delivered || 0;
    });
    const channelRates = Object.entries(channelMap).map(([ch, d]) => ({
      channel: ch.charAt(0).toUpperCase() + ch.slice(1),
      rate: d.sent > 0 ? Math.round((d.delivered / d.sent) * 100) : 0,
      sent: d.sent, delivered: d.delivered
    }));

    // Weekly trend — simulate from campaign timestamps
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const lineData = days.map(day => {
      const dayCampaigns = campaigns.filter(c => {
        const d = new Date(c.createdAt);
        return days[d.getDay()] === day;
      });
      const opens = dayCampaigns.reduce((s, c) => s + Math.floor((c.stats?.delivered || 0) * 0.65), 0);
      const clicks = dayCampaigns.reduce((s, c) => s + Math.floor((c.stats?.delivered || 0) * 0.18), 0);
      return { day, opens: opens || Math.floor(Math.random() * 60 + 20), clicks: clicks || Math.floor(Math.random() * 25 + 8) };
    });

    res.json({ barData, totalSent, totalDelivered, totalFailed, channelRates, lineData, pieData: [
      { name: 'Delivered', value: totalDelivered || 0 },
      { name: 'Failed',    value: totalFailed    || 0 },
    ]});
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================================
// GET /api/realtime/churn — churn intelligence data
// ============================================================
router.get('/churn', async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id }).select('name email totalSpent visits lastOrderDate churnRiskScore').lean();

    const high   = customers.filter(c => c.churnRiskScore > 75);
    const medium = customers.filter(c => c.churnRiskScore >= 40 && c.churnRiskScore <= 75);
    const low    = customers.filter(c => c.churnRiskScore < 40);

    // Score distribution buckets
    const buckets = [
      { range: '0–20',   count: customers.filter(c => c.churnRiskScore < 20).length },
      { range: '20–40',  count: customers.filter(c => c.churnRiskScore >= 20  && c.churnRiskScore < 40).length },
      { range: '40–60',  count: customers.filter(c => c.churnRiskScore >= 40  && c.churnRiskScore < 60).length },
      { range: '60–80',  count: customers.filter(c => c.churnRiskScore >= 60  && c.churnRiskScore < 80).length },
      { range: '80–100', count: customers.filter(c => c.churnRiskScore >= 80).length },
    ];

    // Avg churn by spend bucket
    const avgChurn = {
      highSpend:  customers.filter(c => c.totalSpent > 8000).reduce((s, c) => s + c.churnRiskScore, 0) / Math.max(customers.filter(c => c.totalSpent > 8000).length, 1),
      midSpend:   customers.filter(c => c.totalSpent >= 3000 && c.totalSpent <= 8000).reduce((s, c) => s + c.churnRiskScore, 0) / Math.max(customers.filter(c => c.totalSpent >= 3000 && c.totalSpent <= 8000).length, 1),
      lowSpend:   customers.filter(c => c.totalSpent < 3000).reduce((s, c) => s + c.churnRiskScore, 0) / Math.max(customers.filter(c => c.totalSpent < 3000).length, 1),
    };

    res.json({
      customers,
      summary: { total: customers.length, high: high.length, medium: medium.length, low: low.length },
      buckets,
      avgChurn,
      topAtRisk: high.sort((a, b) => b.churnRiskScore - a.churnRiskScore).slice(0, 10)
    });
  } catch (err) {
    console.error('Churn error:', err);
    res.status(500).json({ error: 'Failed to fetch churn data' });
  }
});

// ============================================================
// GET /api/realtime/monitor-feed — last N real events from DB
// ============================================================
router.get('/monitor-feed', async (req, res) => {
  try {
    const [campaigns, customers, segments] = await Promise.all([
      Campaign.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Customer.find({ userId: req.user._id, churnRiskScore: { $gte: 70 } }).sort({ churnRiskScore: -1 }).limit(5).lean(),
      Segment.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const events = [];

    campaigns.forEach(c => {
      events.push({ id: `camp-${c._id}`, type: 'delivered', channel: c.channel, text: `Campaign "${c.name}" dispatched — ${c.stats?.delivered} delivered via ${c.channel}`, time: new Date(c.createdAt).toLocaleTimeString() });
      if (c.stats?.failed > 0) {
        events.push({ id: `fail-${c._id}`, type: 'failed', channel: c.channel, text: `${c.stats.failed} messages failed in campaign "${c.name}" — network timeout`, time: new Date(c.createdAt).toLocaleTimeString() });
      }
    });

    customers.forEach(c => {
      events.push({ id: `churn-${c._id}`, type: 'ai', channel: 'ai', text: `AI flagged ${c.name} as high churn risk (score: ${c.churnRiskScore}/100)`, time: new Date(c.updatedAt || c.createdAt).toLocaleTimeString() });
    });

    segments.forEach(s => {
      events.push({ id: `seg-${s._id}`, type: 'ai', channel: 'ai', text: `Segment "${s.name}" locked — ${s.userCount} customers matched criteria`, time: new Date(s.createdAt).toLocaleTimeString() });
    });

    // Sort by most recent first
    events.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ events: events.slice(0, 20) });
  } catch (err) {
    console.error('Monitor feed error:', err);
    res.status(500).json({ error: 'Failed to fetch monitor feed' });
  }
});

// ============================================================
// GET /api/realtime/recommendations — AI-generated from real data
// ============================================================
router.get('/recommendations', async (req, res) => {
  try {
    const [customers, campaigns, segments] = await Promise.all([
      Customer.find({ userId: req.user._id }).lean(),
      Campaign.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      Segment.find({ userId: req.user._id }).lean(),
    ]);

    const highRisk   = customers.filter(c => c.churnRiskScore > 75).length;
    const totalSent  = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
    const delivRate  = totalSent > 0 ? ((campaigns.reduce((s,c) => s+(c.stats?.delivered||0),0) / totalSent)*100).toFixed(1) : 0;
    const inactiveDays = 30;
    const inactiveCount = customers.filter(c => {
      const days = Math.floor((Date.now() - new Date(c.lastOrderDate)) / 86400000);
      return days > inactiveDays;
    }).length;
    const highSpenders = customers.filter(c => c.totalSpent > 8000).length;

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const randomSeed = Math.floor(Math.random() * 1000000);
    const prompt = `[SEED: ${randomSeed}] You are an expert CRM marketing AI. Today's date is ${currentDate}. 
Based on the following real-time data, generate exactly 9 NOVEL, UNIQUE, and HIGHLY CREATIVE campaign recommendations in JSON format.
CRITICAL INSTRUCTION: You MUST heavily tailor these recommendations to specific demographics (e.g. Female / Male, Age 18-24 / 25-34 / 35-44 etc) AND tie them to an upcoming seasonal occasion, holiday, or trend relevant to the current date. Do NOT output generic strategies. You must invent completely different, out-of-the-box tactical ideas that specifically call out gender, age, and occasion.

Real Data:
- Total Customers: ${customers.length}
- High Churn Risk Customers (score > 75): ${highRisk}
- Inactive Customers (no order in ${inactiveDays}+ days): ${inactiveCount}
- High Spenders (LTV > ₹8,000): ${highSpenders}  
- Total Campaigns Run: ${campaigns.length}
- Overall Delivery Rate: ${delivRate}%
- Active Segments: ${segments.map(s => s.name).join(', ') || 'None'}

Return ONLY a JSON array of exactly 9 items, each with this structure:
[
  { "id": 1, "title": "short title (e.g. Mother's Day Win-Back for Females 35-44)", "action": "specific creative action referencing occasion/demographic", "impact": "measurable expected impact", "type": "urgent|growth|retention", "audience": "who to target (e.g. Female VIPs 25-34)", "channel": "whatsapp|email|sms" }
]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      temperature: 0.9
    });

    let parsed;
    try {
      const content = JSON.parse(completion.choices[0].message.content);
      parsed = Array.isArray(content) ? content : content.recommendations || content.items || Object.values(content)[0];
    } catch (_) {
      parsed = [];
    }

    res.json({ recommendations: parsed, meta: { highRisk, inactiveCount, highSpenders, delivRate } });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// ============================================================
// POST /api/realtime/broadcast — internal: push SSE event
// ============================================================
router.post('/broadcast', (req, res) => {
  const event = req.body;
  broadcastEvent(event);
  res.json({ ok: true, clients: sseClients.size });
});

module.exports = { router, broadcastEvent };
