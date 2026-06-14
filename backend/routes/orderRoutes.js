const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /api/orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error fetching orders" });
    }
});

module.exports = router;