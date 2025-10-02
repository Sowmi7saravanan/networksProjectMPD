const mongoose = require('../db');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,    // store bcrypt hash
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
