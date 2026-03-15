const mongoose = require('mongoose');

const studentRiskLogSchema = new mongoose.Schema({
  stress_level: { type: Number, required: true },
  sleep_hours: { type: Number, required: true },
  sentiment_score: { type: Number, required: true },
  screen_time_hours: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentRiskLog', studentRiskLogSchema);
