const mongoose = require('mongoose');

const communicationEventSchema = new mongoose.Schema({
    communicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Communication', required: true },
    eventType: { type: String, required: true }, // 'delivered', 'opened', 'clicked'
}, { timestamps: true });

module.exports = mongoose.model('CommunicationEvent', communicationEventSchema);