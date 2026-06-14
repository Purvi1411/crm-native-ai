const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  settings: {
    type: Object,
    default: {
      name: 'Admin', email: 'admin@xenoreach.ai', role: 'CRM Manager', company: 'TechMahindra',
      emailNotifs: true, smsNotifs: false, campaignAlerts: true, churnAlerts: true, weeklyReport: true,
      autoSuggest: true, brandSafety: true, aiModel: 'llama-3.1-8b-instant', temperature: '0.5',
      whatsappEnabled: true, emailEnabled: true, smsEnabled: true, rcsEnabled: false,
      retryAttempts: '3', retryDelay: '5', failureThreshold: '20'
    }
  }
}, { timestamps: true });

// Hash the password before saving to the database
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);