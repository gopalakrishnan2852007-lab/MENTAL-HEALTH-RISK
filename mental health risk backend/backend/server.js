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


// Multi-Student Simulation State
let students = [
  { student_id: 'S001', name: 'Alex Johnson', major: 'Computer Science', year: 'Junior', stress_level: 40, sleep_hours: 7.0, sentiment_score: 0.6, screen_time_hours: 5.0 },
  { student_id: 'S002', name: 'Maria Garcia', major: 'Biology', year: 'Sophomore', stress_level: 65, sleep_hours: 5.5, sentiment_score: -0.2, screen_time_hours: 8.0 },
  { student_id: 'S003', name: 'David Smith', major: 'Economics', year: 'Senior', stress_level: 80, sleep_hours: 4.5, sentiment_score: -0.6, screen_time_hours: 9.5 },
  { student_id: 'S004', name: 'Jasmin Lee', major: 'Psychology', year: 'Freshman', stress_level: 30, sleep_hours: 8.0, sentiment_score: 0.8, screen_time_hours: 3.5 },
  { student_id: 'S005', name: 'Michael Brown', major: 'Engineering', year: 'Junior', stress_level: 55, sleep_hours: 6.0, sentiment_score: 0.1, screen_time_hours: 6.5 }
];

let riskBuffer = [];

// Helper for generating random walk data
const randomWalk = (value, volatility, min, max) => {
    let next = value + (Math.random() - 0.5) * volatility;
    if (next < min) next = min;
    if (next > max) next = max;
    return next;
};

// AI Engine Functions
const calculateRiskScore = (student) => {
  let score = 0;
  // Stress (0-100)
  score += student.stress_level * 0.4;
  // Sleep (opposite impact, 4 is worst, 10 is best)
  score += Math.max(0, (8 - student.sleep_hours) * 10) * 0.3;
  // Sentiment (-1 to 1) -> map -1 to 100 penalty, 1 to 0
  score += ((1 - student.sentiment_score) / 2 * 100) * 0.2;
  // Screen time (above 4 adds risk)
  score += Math.max(0, (student.screen_time_hours - 4) * 5) * 0.1;

  score = Math.min(100, Math.max(0, score));
  
  let risk_level = 'LOW';
  if (score > 75) risk_level = 'HIGH';
  else if (score > 45) risk_level = 'MODERATE';

  // Confidence is a simulated metric of model certainty
  const confidence_score = 85 + Math.random() * 10;

  return { risk_score: score, risk_level, confidence_score };
};

const generateXAI = (student, score) => {
  let explanations = [];
  if (student.stress_level > 70) explanations.push(`Stress level significantly elevated (${student.stress_level.toFixed(1)}/100).`);
  if (student.sleep_hours < 6) explanations.push(`Sleep duration critically low (${student.sleep_hours.toFixed(1)} hrs).`);
  if (student.sentiment_score < 0) explanations.push(`Negative sentiment patterns detected in digital communication.`);
  if (student.screen_time_hours > 8) explanations.push(`Excessive digital screen exposure (${student.screen_time_hours.toFixed(1)} hrs).`);
  
  if (explanations.length === 0) explanations.push("Behavioral metrics are within healthy baseline ranges.");
  
  return explanations;
};

const getRecommendations = (risk_level) => {
  if (risk_level === 'HIGH') return ["Schedule Immediate Counselor Check-in", "Trigger Wellness Check", "Send automated soothing exercises"];
  if (risk_level === 'MODERATE') return ["Recommend Mindfulness Activity", "Suggest limiting screen time before bed", "Check in via Wellness Chatbot"];
  return ["Maintain healthy routines", "Encourage group study activities"];
};

// Start high-frequency telemetry loop (1 second updates for stability visualization)
setInterval(() => {
    let currentSnapshots = [];

    students.forEach((student, index) => {
      // Simulate real-world fluctuations in student status
      student.stress_level = randomWalk(student.stress_level, 3, 0, 100); 
      student.sleep_hours = randomWalk(student.sleep_hours, 0.05, 3, 11); 
      student.sentiment_score = randomWalk(student.sentiment_score, 0.05, -1.0, 1.0); 
      student.screen_time_hours = randomWalk(student.screen_time_hours, 0.1, 0, 14);

      const aiAnalysis = calculateRiskScore(student);
      const explanations = generateXAI(student, aiAnalysis.risk_score);
      const recommendations = getRecommendations(aiAnalysis.risk_level);

      const snapshot = {
          ...student,
          stress_level: Number(student.stress_level.toFixed(2)),
          sleep_hours: Number(student.sleep_hours.toFixed(2)),
          sentiment_score: Number(student.sentiment_score.toFixed(3)),
          screen_time_hours: Number(student.screen_time_hours.toFixed(2)),
          risk_score: Number(aiAnalysis.risk_score.toFixed(1)),
          confidence_score: Number(aiAnalysis.confidence_score.toFixed(1)),
          risk_level: aiAnalysis.risk_level,
          ai_explanation: explanations,
          recommendations: recommendations,
          timestamp: new Date()
      };

      currentSnapshots.push(snapshot);
      riskBuffer.push(snapshot);

      // AI Safety Prediction Logic for Mental Health
      if (snapshot.risk_level === 'HIGH' && Math.random() > 0.8) {
          io.emit('CRITICAL_RISK_INTERVENTION_REQUIRED', {
              message: `CRITICAL ALERT: High risk detected for ${student.name}.`,
              data: snapshot
          });
          
          // Auto-intervention simulation (counselor notification active)
          student.stress_level = Math.max(0, student.stress_level - 5); // Reduces stress slightly due to intervention
      }
    });

    // Sort by risk score descending
    currentSnapshots.sort((a,b) => b.risk_score - a.risk_score);

    // Broadcast the full counselor dashboard view
    io.emit('counselor_dashboard_stream', currentSnapshots);
    
    // For legacy compat or specific chosen student focus, just emit the first most-at-risk
    if (currentSnapshots.length > 0) {
      io.emit('mental_health_stream', currentSnapshots[0]);
    }

}, 1500);

// Background job: Average buffer and save to MongoDB every 10 seconds
setInterval(async () => {
    if (riskBuffer.length === 0) return;
    
    const bufferToSave = [...riskBuffer];
    riskBuffer = []; // Clear buffer

    // In a real app we'd average per student, but for demo we just save the latest snapshots
    // Or we save everything (bulk insert)
    try {
        await StudentRiskLog.insertMany(bufferToSave);
        io.emit('db_log_saved', { message: `Saved ${bufferToSave.length} points of multi-student mental health data` });
    } catch(err) {
        console.error("DB Save error:", err);
    }
    
}, 10000);


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../mental health risk frontend/dist/index.html'));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`MindGuard AI Risk Engine running on port ${PORT}`);
});