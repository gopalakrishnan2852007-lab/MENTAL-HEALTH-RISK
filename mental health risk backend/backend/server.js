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
let altitude = 10; // mm
let ybco_temperature = 77; // Kelvin
let magnetic_flux = 1.5; // Tesla
let pitch = 0;
let roll = 0;
let yaw = 0;

let telemetryBuffer = [];

// Helper for generating random walk data
const randomWalk = (value, volatility, min, max) => {
    let next = value + (Math.random() - 0.5) * volatility;
    if (next < min) next = min;
    if (next > max) next = max;
    return next;
};

// Start high-frequency telemetry loop (100ms)
setInterval(() => {
    // Simulate real-world fluctuations
    altitude = randomWalk(altitude, 2, 0, 500); // Elevate up to 500mm
    ybco_temperature = randomWalk(ybco_temperature, 0.5, 70, 100); // 77K is optimal, >90K is dangerous
    magnetic_flux = randomWalk(magnetic_flux, 0.1, 0, 5); // 0 to 5 Tesla
    pitch = randomWalk(pitch, 1, -45, 45); // Degrees
    roll = randomWalk(roll, 1, -45, 45);
    yaw = randomWalk(yaw, 2, -180, 180);

    const snapshot = {
        altitude: Number(altitude.toFixed(2)),
        ybco_temperature: Number(ybco_temperature.toFixed(2)),
        magnetic_flux: Number(magnetic_flux.toFixed(2)),
        pitch: Number(pitch.toFixed(2)),
        roll: Number(roll.toFixed(2)),
        yaw: Number(yaw.toFixed(2)),
        timestamp: new Date()
    };

    // Buffer for 5s logging
    telemetryBuffer.push(snapshot);

    // AI Safety Prediction Logic
    // If temp > 90K or vibration (pitch/roll magnitude) > 30 degrees
    const vibrationMagnitude = Math.sqrt(pitch * pitch + roll * roll);
    
    if (ybco_temperature > 90 || vibrationMagnitude > 30) {
        io.emit('CRITICAL_FAILURE_INITIATE_LANDING', {
            message: "EMERGENCY: Cooling failure or high instability detected. Initiating automated landing sequence.",
            data: snapshot
        });
        // Simulate automated landing overrides
        altitude = Math.max(0, altitude - 10);
        pitch *= 0.8;
        roll *= 0.8;
    } else {
        io.emit('telemetry_stream', snapshot);
    }

}, 100);

// Background job: Average buffer and save to MongoDB every 5 seconds
setInterval(async () => {
    if (telemetryBuffer.length === 0) return;
    
    // Create an average of the buffer
    const avg = telemetryBuffer.reduce((acc, curr) => {
        acc.altitude += curr.altitude;
        acc.ybco_temperature += curr.ybco_temperature;
        acc.magnetic_flux += curr.magnetic_flux;
        acc.pitch += curr.pitch;
        acc.roll += curr.roll;
        acc.yaw += curr.yaw;
        return acc;
    }, { altitude: 0, ybco_temperature: 0, magnetic_flux: 0, pitch: 0, roll: 0, yaw: 0 });

    const len = telemetryBuffer.length;
    const averagedData = new Telemetry({
        altitude: avg.altitude / len,
        ybco_temperature: avg.ybco_temperature / len,
        magnetic_flux: avg.magnetic_flux / len,
        pitch: avg.pitch / len,
        roll: avg.roll / len,
        yaw: avg.yaw / len,
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
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../mental health risk frontend/dist/index.html'));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Anti-Gravity Engine running on port ${PORT}`);
});