require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Internal Models
const Telemetry = require('./src/models/Telemetry');

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../mental health risk frontend/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/antigravity', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Telemetry Logging')).catch(err => console.error('MongoDB Connection Error:', err));


// State variables for telemetry generation
let altitude_mm = 10; 
let ybco_temp_k = 77; 
let magnetic_flux_t = 1.5; 
let vibration_hz = 15;

let telemetryBuffer = [];

// Helper for generating random walk data
const randomWalk = (value, volatility, min, max) => {
    let next = value + (Math.random() - 0.5) * volatility;
    if (next < min) next = min;
    if (next > max) next = max;
    return next;
};

// Start high-frequency telemetry loop (200ms)
setInterval(() => {
    // Simulate real-world fluctuations
    altitude_mm = randomWalk(altitude_mm, 2, 0, 500); 
    ybco_temp_k = randomWalk(ybco_temp_k, 0.5, 70, 100); 
    magnetic_flux_t = randomWalk(magnetic_flux_t, 0.1, 0, 5); 
    vibration_hz = randomWalk(vibration_hz, 5, 0, 200);

    const snapshot = {
        altitude_mm: Number(altitude_mm.toFixed(2)),
        ybco_temp_k: Number(ybco_temp_k.toFixed(2)),
        magnetic_flux_t: Number(magnetic_flux_t.toFixed(2)),
        vibration_hz: Number(vibration_hz.toFixed(2)),
        timestamp: new Date()
    };

    // Buffer for 5s logging
    telemetryBuffer.push(snapshot);

    // AI Safety Prediction Logic
    if (ybco_temp_k > 90) {
        io.emit('CRITICAL_WARNING_COOLING_FAILURE', {
            message: "EMERGENCY: CRYOGENIC COOLING FAILURE",
            data: snapshot
        });
        // Simulate automated landing overrides
        altitude_mm = Math.max(0, altitude_mm - 10);
    } else {
        io.emit('telemetry_stream', snapshot);
    }

}, 200);

// Background job: Average buffer and save to MongoDB every 5 seconds
setInterval(async () => {
    if (telemetryBuffer.length === 0) return;
    
    // Create an average of the buffer
    const avg = telemetryBuffer.reduce((acc, curr) => {
        acc.altitude += curr.altitude_mm ?? curr.altitude; // Fallback mapping with proper zero handling
        acc.ybco_temperature += curr.ybco_temp_k ?? curr.ybco_temperature;
        acc.magnetic_flux += curr.magnetic_flux_t ?? curr.magnetic_flux;
        return acc;
    }, { altitude: 0, ybco_temperature: 0, magnetic_flux: 0 });

    const len = telemetryBuffer.length;
    const averagedData = new Telemetry({
        altitude: avg.altitude / len,
        ybco_temperature: avg.ybco_temperature / len,
        magnetic_flux: avg.magnetic_flux / len,
        pitch: 0,
        roll: 0,
        yaw: 0,
        timestamp: new Date()
    });

    try {
        await averagedData.save();
        io.emit('db_log_saved', { message: `Saved ${len} points averaged data` });
    } catch(err) {
        console.error("DB Save error:", err);
    }
    
    // Clear buffer
    telemetryBuffer = [];

}, 5000);


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../../mental health risk frontend/dist/index.html'));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Anti-Gravity Engine running on port ${PORT}`);
});