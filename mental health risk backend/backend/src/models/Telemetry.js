const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  altitude: { type: Number, required: true },
  ybco_temperature: { type: Number, required: true },
  magnetic_flux: { type: Number, required: true },
  pitch: { type: Number, required: true },
  roll: { type: Number, required: true },
  yaw: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Telemetry', telemetrySchema);
