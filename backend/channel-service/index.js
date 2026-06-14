const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// The URL of your main CRM's webhook receiver
const CRM_WEBHOOK_URL = 'http://localhost:5000/api/webhook/status';

app.post('/send', (req, res) => {
    const { communicationId, channel, message } = req.body;
    
    console.log(`[SIMULATOR] Received ${channel} message for comm: ${communicationId}`);

    // 1. Immediately acknowledge receipt so the main CRM doesn't freeze waiting for a response
    res.status(200).json({ status: 'accepted', communicationId });

    // 2. Simulate a network delay (1 to 3 seconds) before "delivering" the message
    setTimeout(async () => {
        const isDelivered = Math.random() > 0.1; // 90% chance of success
        const newStatus = isDelivered ? 'delivered' : 'failed';

        console.log(`[SIMULATOR] Updating comm: ${communicationId} to ${newStatus}`);

        try {
            await axios.post(CRM_WEBHOOK_URL, {
                communicationId,
                status: newStatus
            });
        } catch (err) {
            console.error("[SIMULATOR] Failed to reach CRM webhook. Is port 5000 running?");
        }

        // 3. If it was delivered successfully, simulate the user "opening" it a few seconds later
        if (isDelivered) {
            setTimeout(async () => {
                const isOpened = Math.random() > 0.4; // 60% chance they open it
                if (isOpened) {
                    console.log(`[SIMULATOR] Updating comm: ${communicationId} to opened`);
                    try {
                        await axios.post(CRM_WEBHOOK_URL, {
                            communicationId,
                            status: 'opened'
                        });
                    } catch (err) {
                        console.error("[SIMULATOR] Failed to reach CRM webhook.");
                    }
                }
            }, Math.random() * 4000 + 2000); // Wait 2-6 seconds
        }

    }, Math.random() * 2000 + 1000); // Wait 1-3 seconds
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Channel Simulator running on port ${PORT}`));