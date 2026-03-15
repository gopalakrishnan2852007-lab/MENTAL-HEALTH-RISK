require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Internal Models
const StudentRiskLog = require('./src/models/StudentRiskLog');

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
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gopal123:Gopal1405M@cluster0.qiw5207.mongodb.net/antigravity?appName=Cluster0')
.then(() => console.log('MongoDB Connected for Telemetry Logging')).catch(err => console.error('MongoDB Connection Error:', err));


// State variables for student risk data generation
let stress_level = 30; // 0 to 100
let sleep_hours = 7.5; // 4 to 10
let sentiment_score = 0.5; // -1.0 to 1.0 (Positive)
let screen_time_hours = 4.0; // 0 to 12

let riskBuffer = [];

// Helper for generating random walk data
const randomWalk = (value, volatility, min, max) => {
    let next = value + (Math.random() - 0.5) * volatility;
    if (next < min) next = min;
    if (next > max) next = max;
    return next;
};

// Start high-frequency telemetry loop (1 second updates for stability visualization)
setInterval(() => {
    // Simulate real-world fluctuations in student status
    stress_level = randomWalk(stress_level, 5, 0, 100); 
    sleep_hours = randomWalk(sleep_hours, 0.1, 4, 10); 
    sentiment_score = randomWalk(sentiment_score, 0.05, -1.0, 1.0); 
    screen_time_hours = randomWalk(screen_time_hours, 0.2, 0, 12);

    const snapshot = {
        stress_level: Number(stress_level.toFixed(2)),
        sleep_hours: Number(sleep_hours.toFixed(2)),
        sentiment_score: Number(sentiment_score.toFixed(3)),
        screen_time_hours: Number(screen_time_hours.toFixed(2)),
        timestamp: new Date()
    };

    // Buffer for 5s logging
    riskBuffer.push(snapshot);

    // AI Safety Prediction Logic for Mental Health
    if (stress_level > 85 && sleep_hours < 5) {
        io.emit('CRITICAL_RISK_INTERVENTION_REQUIRED', {
            message: "CRITICAL ALERT: High stress and severe sleep deprivation detected.",
            data: snapshot
        });
        
        // Auto-intervention simulation (counselor notification active)
        stress_level = Math.max(0, stress_level - 15);
        sleep_hours += 0.5; // Student rested
    } else {
        io.emit('mental_health_stream', snapshot);
    }

}, 1000);

// Background job: Average buffer and save to MongoDB every 5 seconds
setInterval(async () => {
    if (riskBuffer.length === 0) return;
    
    // Create an average of the buffer
    const avg = riskBuffer.reduce((acc, curr) => {
        acc.stress += curr.stress_level; 
        acc.sleep += curr.sleep_hours;
        acc.sentiment += curr.sentiment_score;
        acc.screen += curr.screen_time_hours;
        return acc;
    }, { stress: 0, sleep: 0, sentiment: 0, screen: 0 });

    const len = riskBuffer.length;
    const averagedData = new StudentRiskLog({
        stress_level: avg.stress / len,
        sleep_hours: avg.sleep / len,
        sentiment_score: avg.sentiment / len,
        screen_time_hours: avg.screen / len,
        timestamp: new Date()
    });

    try {
        await averagedData.save();
        io.emit('db_log_saved', { message: `Saved ${len} points averaged mental health data` });
    } catch(err) {
        console.error("DB Save error:", err);
    }
    
    // Clear buffer
    riskBuffer = [];

}, 5000);


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../mental health risk frontend/dist/index.html'));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Mental Health Risk Engine running on port ${PORT}`);
});