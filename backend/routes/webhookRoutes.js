const express = require('express');
const router = express.Router();
const Communication = require('../models/Communication');
const CommunicationEvent = require('../models/CommunicationEvent');

router.post('/status', async (req, res) => {
    const { communicationId, status } = req.body;

    try {
        await Communication.findByIdAndUpdate(communicationId, { status });
        await CommunicationEvent.create({ communicationId, eventType: status });
        res.status(200).send('OK');
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send('Error processing webhook');
    }
});

module.exports = router;