const mongoose = require('../db');
const AlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Alert', AlertSchema);
