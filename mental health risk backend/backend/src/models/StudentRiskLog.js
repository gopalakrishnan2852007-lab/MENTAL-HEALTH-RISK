const mongoose = require('mongoose');

const studentRiskLogSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  name: { type: String, required: true },
  major: { type: String, required: false },
  year: { type: String, required: false },
  
  stress_level: { type: Number, required: true },
  sleep_hours: { type: Number, required: true },
  sentiment_score: { type: Number, required: true },
  screen_time_hours: { type: Number, required: true },
  
  risk_score: { type: Number, required: true },
  confidence_score: { type: Number, required: true },
  risk_level: { type: String, enum: ['LOW', 'MODERATE', 'HIGH'], required: true },
  ai_explanation: [{ type: String }],
  recommendations: [{ type: String }],
  
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentRiskLog', studentRiskLogSchema);
