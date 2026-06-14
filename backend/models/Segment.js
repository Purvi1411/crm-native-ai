const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    criteria: { type: String, required: true },
    userCount: { type: Number, default: 0 },
    // 🔥 NEW: Storing the exact users targeted!
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Segment', segmentSchema);