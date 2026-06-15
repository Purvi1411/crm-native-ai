const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Seed fake customers (For testing purposes)
// @route   POST /api/customers/seed
const seedCustomers = async (req, res) => {
    try {
        await Customer.deleteMany({ userId: req.user._id }); // Clear existing for this user
        
        const indianStates = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Telangana", "Uttar Pradesh", "West Bengal", "Rajasthan", "Kerala"];
        const globalCountries = [
            { country: "United States", state: "California" }, { country: "United States", state: "New York" },
            { country: "United Kingdom", state: "England" }, { country: "Canada", state: "Ontario" },
            { country: "Australia", state: "New South Wales" }, { country: "Germany", state: "Berlin" },
            { country: "France", state: "Île-de-France" }, { country: "Singapore", state: "Singapore" }
        ];
        
        const firsts = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "John", "Emma", "Kavya", "Sai", "Aisha", "David", "Sarah"];
        const lasts = ["Sharma", "Patel", "Kumar", "Iyer", "Singh", "Doe", "Smith", "Reddy", "Verma", "Johnson"];
        const genders = ["Male", "Female"];
        const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];

        const dummyData = [];
        for (let i = 0; i < 150; i++) {
            // 70% Indian, 30% Global
            const isIndia = Math.random() > 0.3;
            let country = "India";
            let state = indianStates[Math.floor(Math.random() * indianStates.length)];
            
            if (!isIndia) {
                const globalLoc = globalCountries[Math.floor(Math.random() * globalCountries.length)];
                country = globalLoc.country;
                state = globalLoc.state;
            }

            const fname = firsts[Math.floor(Math.random() * firsts.length)];
            const lname = lasts[Math.floor(Math.random() * lasts.length)];
            
            dummyData.push({
                userId: req.user._id,
                name: `${fname} ${lname}`,
                email: `${fname.toLowerCase()}.${lname.toLowerCase()}${i}.${Date.now()}@example.com`,
                totalSpent: Math.floor(Math.random() * 15000) + 100,
                visits: Math.floor(Math.random() * 50) + 1,
                lastOrderDate: new Date(Date.now() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000),
                gender: genders[Math.floor(Math.random() * genders.length)],
                ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
                country: country,
                state: state,
                churnRiskScore: Math.floor(Math.random() * 100)
            });
        }

        await Customer.insertMany(dummyData);
        const customers = await Customer.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a single customer
// @route   POST /api/customers
const addCustomer = async (req, res) => {
    try {
        const { name, email, totalSpent, visits, lastOrderDate, gender, ageGroup, country, state } = req.body;
        
        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if customer already exists for this user
        const existing = await Customer.findOne({ email, userId: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'Customer with this email already exists' });
        }

        const newCustomer = new Customer({
            userId: req.user._id,
            name, email, 
            totalSpent: totalSpent || 0, 
            visits: visits || 0, 
            lastOrderDate: lastOrderDate || new Date(),
            gender, ageGroup,
            country: country || 'India',
            state
        });

        const saved = await newCustomer.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add multiple customers in bulk (CSV upload)
// @route   POST /api/customers/bulk
const addCustomersBulk = async (req, res) => {
    try {
        const customers = req.body.customers;
        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            return res.status(400).json({ message: 'Valid customers array is required' });
        }

        const bulkOps = customers.map(c => ({
            updateOne: {
                filter: { email: c.email, userId: req.user._id },
                update: { $set: {
                    userId: req.user._id,
                    name: c.name,
                    totalSpent: c.totalSpent || 0,
                    visits: c.visits || 0,
                    lastOrderDate: c.lastOrderDate || new Date(),
                    gender: c.gender,
                    ageGroup: c.ageGroup,
                    country: c.country || 'India',
                    state: c.state || null
                }},
                upsert: true
            }
        }));

        const result = await Customer.bulkWrite(bulkOps);
        res.status(201).json({ message: `Bulk uploaded successfully. Upserted/Updated ${customers.length} records.`, result });
    } catch (error) {
        console.error("Error in bulk upload:", error);
        res.status(500).json({ message: 'Server Error during bulk upload', error: error.message, stack: error.stack });
    }
};

// @desc    Clear all customers
// @route   DELETE /api/customers/clear
const clearCustomers = async (req, res) => {
    try {
        await Customer.deleteMany({ userId: req.user._id });
        res.json({ message: 'All customers cleared successfully.' });
    } catch (error) {
        console.error("Error clearing customers:", error);
        res.status(500).json({ message: 'Server Error clearing customers' });
    }
};

module.exports = { getCustomers, seedCustomers, addCustomer, addCustomersBulk, clearCustomers };