const express = require('express');
const dotenv = require('dotenv');
require('dotenv').config();
// 1. MUST BE FIRST: Load environment variables!
dotenv.config();

// 2. NOW LOAD EVERYTHING ELSE
const cors = require('cors');
const mongoose = require('mongoose'); // 🔥 Added to check connection status
const connectDB = require('./config/db');
require('./config/passport'); // Now this can safely read the .env file!

// Connect to MongoDB
connectDB();

const app = express();
app.set('trust proxy', 1);

// Middleware to parse JSON and allow cross-origin requests
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(require('passport').initialize());

// Route Imports
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const { router: realtimeRoutes, broadcastEvent } = require('./routes/realtimeRoutes');

// New Route Imports for Orders and Segments
const orderRoutes = require('./routes/orderRoutes');
const segmentRoutes = require('./routes/segmentRoutes');

// Expose broadcastEvent globally so campaign/segment routes can push SSE
global.broadcastEvent = broadcastEvent;

// Mount Routes
const { protect } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/ai', protect, aiRoutes);
app.use('/api/campaigns', protect, campaignRoutes);
app.use('/api/webhook', webhookRoutes); // Webhook usually comes from external service without our JWT
app.use('/api/realtime', protect, realtimeRoutes);

// Mount New Routes
app.use('/api/orders', protect, orderRoutes);
app.use('/api/segments', protect, segmentRoutes);

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Hackathon API is running...');
});

// Test route
app.get('/api/auth/test', (req, res) => {
  res.send('🚨 THE SERVER IS ALIVE AND THE ROUTE WORKS! 🚨');
});

// Start the server
const PORT = process.env.PORT || 5099;

// Models needed for seeding
const Communication = require('./models/Communication');
const Order = require('./models/Order');
const Segment = require('./models/Segment');

// 🔥 THE FIX: Tell Mongoose to wait until the connection is "open" before running scripts
mongoose.connection.once('open', async () => {
    console.log("📦 MongoDB connection established! Running startup scripts...");

    try {
        // 1. Fix the demo data for the AI Copilot
        await Communication.updateMany({}, { status: "delivered" });
        console.log("✅ All messages updated to 'delivered'!");

        // 2. Seed the Orders and Segments Database
        const orderCount = await Order.countDocuments();
        if (orderCount === 0) {
            await Order.insertMany([
                { customer: 'Rahul Sharma', totalAmount: 1250, status: 'delivered', date: 'Just now' },
                { customer: 'Priya Patel', totalAmount: 450, status: 'processing', date: '2 hrs ago' },
                { customer: 'Amit Kumar', totalAmount: 3200, status: 'shipped', date: '5 hrs ago' },
                { customer: 'Neha Singh', totalAmount: 890, status: 'delivered', date: '1 day ago' },
                { customer: 'Vikram Mehta', totalAmount: 5400, status: 'pending', date: '2 days ago' }
            ]);
            await Segment.insertMany([
                { name: "VIP Coffee Buyers", criteria: "Spend > ₹5000, Category: Coffee", userCount: 142 },
                { name: "High Churn Risk", criteria: "Inactive > 60 days, Risk > 75", userCount: 89 },
                { name: "Recent Onboards", criteria: "Signup < 14 days", userCount: 312 }
            ]);
            console.log("✅ Database seeded with Orders and Segments!");
        }
    } catch (err) {
        console.error("Database seeding error:", err);
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});