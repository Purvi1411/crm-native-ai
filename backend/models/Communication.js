const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    status: { 
        type: String, 
        default: 'pending', 
        // Added 'sending' to represent a message currently in the retry loop
        enum: ['pending', 'sending', 'delivered', 'failed', 'opened', 'clicked'] 
    },
    attempts: { type: Number, default: 0 }, // Tracks how many times the CRM tried to send this message
    errorLogs: [String] // Stores 503 error messages to show the reviewers you handle failures
}, { timestamps: true });

module.exports = mongoose.model('Communication', communicationSchema);