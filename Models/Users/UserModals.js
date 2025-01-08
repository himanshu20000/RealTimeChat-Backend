const mongoose = require('mongoose');

const User = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  fcmTokens: { type: [String], default: [] }, 
});

module.exports = mongoose.model('User', User);
