require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Internal Models
const StudentRiskLog = require('./src/models/StudentRiskLog');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../mental health risk frontend/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gopal123:Gopal1405M@cluster0.qiw5207.mongodb.net/antigravity?appName=Cluster0';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected for MindGuard Telemetry'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Simulation State
let students = [
  { student_id: 'S001', name: 'Alex Johnson', major: 'Computer Science', year: 'Junior', stress_level: 40, sleep_hours: 7.0, sentiment_score: 0.6, screen_time_hours: 5.0 },
  { student_id: 'S002', name: 'Maria Garcia', major: 'Biology', year: 'Sophomore', stress_level: 65, sleep_hours: 5.5, sentiment_score: -0.2, screen_time_hours: 8.0 },
  { student_id: 'S003', name: 'David Smith', major: 'Economics', year: 'Senior', stress_level: 80, sleep_hours: 4.5, sentiment_score: -0.6, screen_time_hours: 9.5 },
  { student_id: 'S004', name: 'Jasmin Lee', major: 'Psychology', year: 'Freshman', stress_level: 30, sleep_hours: 8.0, sentiment_score: 0.8, screen_time_hours: 3.5 },
  { student_id: 'S005', name: 'Michael Brown', major: 'Engineering', year: 'Junior', stress_level: 55, sleep_hours: 6.0, sentiment_score: 0.1, screen_time_hours: 6.5 }
];

let riskBuffer = [];
const AI_MICROSERVICE_URL = process.env.AI_MICROSERVICE_URL || 'http://localhost:8000';

// API Endpoints
app.post('/api/checkin', async (req, res) => {
    const { student_id, stress_level, mood, journal } = req.body;
    
    const studentIdx = students.findIndex(s => s.student_id === student_id);
    if (studentIdx === -1) return res.status(404).json({ error: 'Student not found' });

    console.log(`[Check-in] Received data for student ${student_id}`);

    // Update simulation state based on check-in
    // If mood is 'low', sentiment drops. If 'high', sentiment rises.
    if (mood === 'low') students[studentIdx].sentiment_score = Math.max(-1, students[studentIdx].sentiment_score - 0.3);
    if (mood === 'high') students[studentIdx].sentiment_score = Math.min(1, students[studentIdx].sentiment_score + 0.3);
    
    // Manually set stress if provided
    if (stress_level) students[studentIdx].stress_level = stress_level * 10; // 1-10 to 0-100 scale

    // Trigger immediate AI re-evaluation
    try {
        const response = await axios.post(`${AI_MICROSERVICE_URL}/predict_risk`, {
            student_id: students[studentIdx].student_id,
            stress_level: students[studentIdx].stress_level,
            sleep_hours: students[studentIdx].sleep_hours,
            sentiment_score: students[studentIdx].sentiment_score,
            screen_time_hours: students[studentIdx].screen_time_hours
        });

        const assessment = response.data;
        res.json({ message: 'Check-in processed', assessment });
    } catch (error) {
        console.error('AI Microservice Error during check-in:', error.message);
        res.status(500).json({ error: 'AI evaluation failed' });
    }
});

// Telemetry Logic
const randomWalk = (value, volatility, min, max) => {
    let next = value + (Math.random() - 0.5) * volatility;
    return Math.min(max, Math.max(min, next));
};

async function broadcastUpdates() {
    let currentSnapshots = [];

    for (const student of students) {
        // Natural fluctuations
        student.stress_level = randomWalk(student.stress_level, 2, 0, 100);
        student.sleep_hours = randomWalk(student.sleep_hours, 0.05, 3, 11);
        student.sentiment_score = randomWalk(student.sentiment_score, 0.05, -1, 1);
        student.screen_time_hours = randomWalk(student.screen_time_hours, 0.1, 0, 14);

        try {
            // Call AI Microservice for accurate prediction
            const response = await axios.post(`${AI_MICROSERVICE_URL}/predict_risk`, {
                student_id: student.student_id,
                stress_level: student.stress_level,
                sleep_hours: student.sleep_hours,
                sentiment_score: student.sentiment_score,
                screen_time_hours: student.screen_time_hours
            });

            const ai = response.data;
            const snapshot = {
                ...student,
                risk_score: ai.risk_score,
                risk_level: ai.risk_level,
                confidence_score: ai.confidence_score,
                ai_explanation: ai.ai_explanation,
                recommendations: ai.recommendations,
                timestamp: new Date()
            };

            currentSnapshots.push(snapshot);
            riskBuffer.push(snapshot);

            // Alert logic
            if (snapshot.risk_level === 'HIGH' && Math.random() > 0.9) {
                io.emit('CRITICAL_RISK_INTERVENTION_REQUIRED', {
                    message: `CRITICAL ALERT: High risk detected for ${student.name}.`,
                    data: snapshot
                });
            }
        } catch (err) {
            // Fallback if microservice is down
            console.warn(`[AI SERVICE DOWN] Using fallback local logic for ${student.name}`);
            currentSnapshots.push({
                ...student,
                risk_score: 50,
                risk_level: 'MODERATE',
                ai_explanation: ["Connect with internal sensor logic..."],
                recommendations: ["Ensure AI microservice is active"],
                timestamp: new Date()
            });
        }
    }

    currentSnapshots.sort((a, b) => b.risk_score - a.risk_score);
    io.emit('counselor_dashboard_stream', currentSnapshots);
}

// 2-second broadcast interval
setInterval(broadcastUpdates, 2000);

// Data persistence every 30s
setInterval(async () => {
    if (riskBuffer.length === 0) return;
    const toSave = [...riskBuffer];
    riskBuffer = [];
    try {
        await StudentRiskLog.insertMany(toSave);
        console.log(`[DB] Saved ${toSave.length} records`);
    } catch (err) {
        console.error('[DB ERROR]', err.message);
    }
}, 30000);

// Catch-all route to serve the Single Page Application
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../mental health risk frontend/dist/index.html'));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`MindGuard AI Risk Engine running on port ${PORT}`);
});