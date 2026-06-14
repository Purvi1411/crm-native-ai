const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// Generate a JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Seed 300 dummy customers for a newly registered user so the app is instantly usable
const seedCustomersForUser = async (userId) => {
    const count = await Customer.countDocuments({ userId });
    if (count > 0) return; // Already has data

    const dummyCustomers = [];
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const maleNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Rahul', 'Amit', 'Vikram', 'Karan'];
    const femaleNames = ['Kavya', 'Diya', 'Ananya', 'Isha', 'Riya', 'Aisha', 'Priya', 'Neha', 'Sneha', 'Pooja'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Bose', 'Gupta', 'Verma', 'Jain', 'Mehta', 'Reddy', 'Rao', 'Nair'];

    for (let i = 0; i < 300; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randomDaysAgo = Math.floor(Math.random() * 90);
        const lastOrder = new Date();
        lastOrder.setDate(lastOrder.getDate() - randomDaysAgo);

        dummyCustomers.push({
            userId,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            totalSpent: Math.floor(Math.random() * 12000) + 500,
            visits: Math.floor(Math.random() * 15) + 1,
            lastOrderDate: lastOrder,
            gender: isMale ? 'Male' : 'Female',
            ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)]
        });
    }
    await Customer.insertMany(dummyCustomers);
};

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user in database
    const user = await User.create({ name, email, password });

    if (user) {
      await seedCustomersForUser(user._id);
      
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const crypto = require('crypto');

// Authenticate user & get token
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check password
    if (user && (await user.matchPassword(password))) {
      await seedCustomersForUser(user._id);

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password (Direct Update)
const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Please provide both email and new password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully! You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };