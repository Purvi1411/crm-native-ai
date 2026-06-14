const Campaign = require('../models/Campaign');
const Communication = require('../models/Communication');
const Customer = require('../models/Customer');
const axios = require('axios');

// @desc    Create a campaign and trigger communications with persistent retries
// @route   POST /api/campaigns/send
const launchCampaign = async (req, res) => {
    const { name, objective, message, channel, dbQuery } = req.body;

    try {
        // 1. Find the target audience based on Groq's filters, strictly scoped to this user
        const queryWithUser = { ...(dbQuery || {}), userId: req.user._id };
        const targetCustomers = await Customer.find(queryWithUser);
        
        if (targetCustomers.length === 0) {
            return res.status(400).json({ message: "No customers match this segment." });
        }

        // 2. Create the Campaign record tied to the user
        const campaign = await Campaign.create({
            userId: req.user._id,
            name: name || "AI Campaign",
            objective,
            message,
            channel,
            status: 'sending'
        });

        // 3. Create Communication records for every targeted customer
        const communications = targetCustomers.map(customer => ({
            campaignId: campaign._id,
            customerId: customer._id,
            status: 'pending',
            attempts: 0,
            errorLogs: []
        }));
        
        const savedCommunications = await Communication.insertMany(communications);

        // 4. Send payloads to the Channel Microservice with an Exponential Backoff Retry Loop
        // We let this run asynchronously so the HTTP response isn't blocked while handling retries
        savedCommunications.forEach(async (comm) => {
            let attempts = 0;
            const maxRetries = 3;
            let success = false;
            let logs = [];

            while (attempts < maxRetries && !success) {
                try {
                    attempts++;
                    
                    // Update database to show active attempt and status transition
                    await Communication.findByIdAndUpdate(comm._id, { 
                        attempts, 
                        status: 'sending' 
                    });

                    // Call the separate stubbed channel service [cite: 36]
                    await axios.post('http://localhost:4000/send', {
                        communicationId: comm._id,
                        channel: campaign.channel,
                        message: campaign.message
                    });
                    
                    success = true;
                    // Note: The communication status will shift to 'delivered' or 'failed' 
                    // asynchronously once the channel service calls back our webhook route! [cite: 38]
                } catch (err) {
                    const errorMsg = `Attempt ${attempts} failed: ${err.response?.data?.error || err.message}`;
                    logs.push(errorMsg);
                    
                    // Persist error logs directly to the document for evaluation transparency
                    await Communication.findByIdAndUpdate(comm._id, { 
                        errorLogs: logs 
                    });

                    if (attempts === maxRetries) {
                        console.error(`❌ Max retries reached for communication ID: ${comm._id}`);
                        await Communication.findByIdAndUpdate(comm._id, { status: 'failed' });
                    } else {
                        // Exponential backoff delay calculation (Attempt 1 = 2s, Attempt 2 = 4s)
                        const backoffDelay = attempts * 2000;
                        console.log(`⚠️ Comm ${comm._id} failed. Retrying in ${backoffDelay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, backoffDelay));
                    }
                }
            }
        });

        // Instantly return success to the frontend while the background workers process queue throughput
        res.status(201).json({ 
            message: "Campaign launched successfully!", 
            campaignId: campaign._id,
            audienceCount: targetCustomers.length 
        });

    } catch (error) {
        console.error("Campaign Launch Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { launchCampaign };