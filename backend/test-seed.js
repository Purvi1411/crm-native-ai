const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const connectDB = require('./config/db');

async function test() {
    require('dotenv').config();
    await connectDB();
    
    // Simulate req.user._id
    const userId = new mongoose.Types.ObjectId();
    
    // Seed
    await Customer.deleteMany({ userId });
    const dummyData = [];
    for(let i=0; i<150; i++) {
        dummyData.push({
            userId,
            name: "Test " + i,
            email: "test" + i + "@example.com",
            totalSpent: 100,
            visits: 1,
            lastOrderDate: new Date(),
            gender: "Male",
            ageGroup: "18-24",
            country: "India",
            state: "Delhi",
            churnRiskScore: 50
        });
    }
    console.log("Inserting...");
    await Customer.insertMany(dummyData);
    
    console.log("Fetching immediately...");
    const customers1 = await Customer.find({ userId });
    console.log(`Fetched ${customers1.length} customers immediately.`);
    
    console.log("Fetching after 1 sec...");
    await new Promise(r => setTimeout(r, 1000));
    const customers2 = await Customer.find({ userId });
    console.log(`Fetched ${customers2.length} customers after 1 sec.`);
    
    process.exit(0);
}

test();
