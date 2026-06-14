const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    totalSpent: { type: Number, required: true },
    visits: { type: Number, required: true },
    lastOrderDate: { type: Date, required: true },
    churnRiskScore: { type: Number, default: 0 },
    gender: { type: String },
    ageGroup: { type: String },
    country: { type: String, default: 'India' },
    state: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Unique email per user (not globally unique)
CustomerSchema.index({ email: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', CustomerSchema);