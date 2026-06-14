const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('customers');
        
        try {
            await collection.dropIndex('email_1');
            console.log('Successfully dropped index email_1');
        } catch (e) {
            console.log('Index email_1 might not exist or already dropped:', e.message);
        }
        
        mongoose.disconnect();
    } catch (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    }
};

dropIndex();
