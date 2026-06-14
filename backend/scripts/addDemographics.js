require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed", err);
        process.exit(1);
    }
};

const updateDemographics = async () => {
    await connectDB();

    const customers = await Customer.find({});
    console.log(`Found ${customers.length} customers to update.`);

    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
    
    // Simple heuristic: name-based guessing for realism, but mostly random
    const femaleNames = ["Kavya", "Priya", "Riya", "Aisha", "Isha", "Neha", "Pooja"];
    const maleNames = ["Vikram", "Karan", "Sai", "Aarav", "Amit", "Rahul", "Vihaan", "Arjun"];

    let updatedCount = 0;

    for (let c of customers) {
        const firstName = c.name.split(' ')[0];
        
        let gender = 'Female';
        if (maleNames.includes(firstName)) {
            gender = 'Male';
        } else if (!femaleNames.includes(firstName)) {
            gender = Math.random() > 0.5 ? 'Male' : 'Female';
        }

        const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];

        c.gender = gender;
        c.ageGroup = ageGroup;
        
        await c.save();
        updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} customers with gender and ageGroup.`);
    process.exit(0);
};

updateDemographics();
