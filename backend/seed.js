const mongoose = require('mongoose');
require('dotenv').config();
const Customer = require('./models/Customer'); // Assumes your model is in the models folder

const seedCustomers = async () => {
    try {
        // Connect to MongoDB using your env variable (fallback to localhost if missing)
        await mongoose.connect('mongodb+srv://purvipal27_db_user:Passwordd@cluster0.1jjmyck.mongodb.net/?appName=Cluster0');
        console.log('🔌 Connected to Database. Clearing old test data...');
        
        // Wipe the old list so we have a clean slate
        await Customer.deleteMany({}); 

        const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Kavya', 'Diya', 'Ananya', 'Isha', 'Riya', 'Aisha', 'Priya', 'Neha', 'Rahul', 'Amit', 'Vikram', 'Sneha', 'Pooja', 'Karan'];
        const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Bose', 'Gupta', 'Verma', 'Jain', 'Mehta', 'Reddy', 'Rao', 'Nair', 'Menon', 'Iyer', 'Pillai', 'Chauhan', 'Rajput', 'Yadav', 'Malhotra'];

        const dummyCustomers = [];

        const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
        
        // Generate 300 unique customers
        for (let i = 0; i < 300; i++) {
            const isMale = Math.random() > 0.5;
            const maleNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Rahul', 'Amit', 'Vikram', 'Karan'];
            const femaleNames = ['Kavya', 'Diya', 'Ananya', 'Isha', 'Riya', 'Aisha', 'Priya', 'Neha', 'Sneha', 'Pooja'];
            const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const gender = isMale ? 'Male' : 'Female';
            const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
            
            // Randomize last order date anywhere between today and 90 days ago
            const randomDaysAgo = Math.floor(Math.random() * 90); 
            const lastOrder = new Date();
            lastOrder.setDate(lastOrder.getDate() - randomDaysAgo);

            dummyCustomers.push({
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
                totalSpent: Math.floor(Math.random() * 12000) + 500, // Randomized spend between ₹500 and ₹12,500
                visits: Math.floor(Math.random() * 15) + 1,
                lastOrderDate: lastOrder,
                gender: gender,
                ageGroup: ageGroup
            });
        }

        // Blast them all into MongoDB at once
        await Customer.insertMany(dummyCustomers);
        console.log('✅ Successfully seeded 300 new customers! 🚀');
        process.exit(); // Kill the script once finished

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedCustomers();