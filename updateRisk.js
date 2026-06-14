require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Customer = require('./backend/models/Customer');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const customers = await Customer.find();
    console.log('Found ' + customers.length + ' customers');
    
    let high = 0, medium = 0, low = 0;
    
    for (let i = 0; i < customers.length; i++) {
        let score;
        if (i % 5 === 0) {
            score = Math.floor(Math.random() * 24) + 76;
            high++;
        } else if (i % 5 === 1 || i % 5 === 2) {
            score = Math.floor(Math.random() * 36) + 40;
            medium++;
        } else {
            score = Math.floor(Math.random() * 35) + 5;
            low++;
        }
        await Customer.updateOne({ _id: customers[i]._id }, { $set: { churnRiskScore: score } });
    }
    console.log('Updated: ' + high + ' high, ' + medium + ' medium, ' + low + ' low');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
