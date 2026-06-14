const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    objective: { type: String },
    message: { type: String, required: true },
    channel: { type: String, required: true, enum: ['whatsapp', 'email', 'sms'] },
    status: { type: String, default: 'draft', enum: ['draft', 'sending', 'completed'] },
    
    // 🔥 THESE WERE MISSING: MongoDB was dropping your numbers without these!
    audience: { type: String, default: 'Dynamic AI Segment' },
    
    // 🔥 NEW: Storing the exact users targeted!
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    
    stats: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);