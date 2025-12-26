const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, default: "" },
  
  // UPDATED: Added 'vendor' role
  role: { 
    type: String, 
    enum: ['student', 'restaurant', 'vendor'], 
    default: 'student' 
  },

  // NEW: Only for Restaurants
  certificateId: { type: String, default: "" } 
});

module.exports = mongoose.model('User', UserSchema);