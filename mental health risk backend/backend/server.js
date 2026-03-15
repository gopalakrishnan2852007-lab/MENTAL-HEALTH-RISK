const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// ==========================================
// 📍 STUDENT COHORT DATA
// ==========================================
const STUDENTS = [
  { id: 1, name: 'Alice Johnson', major: 'Computer Science', year: 2, gpa: 3.8 },
  { id: 2, name: 'Michael Smith', major: 'Mechanical Engineering', year: 3, gpa: 3.2 },
  { id: 3, name: 'Sophia Lee', major: 'Biology', year: 1, gpa: 3.9 },
  { id: 4, name: 'David Brown', major: 'Architecture', year: 4, gpa: 2.8 },
  { id: 5, name: 'Emma Davis', major: 'Psychology', year: 2, gpa: 3.6 },
  { id: 6, name: 'James Wilson', major: 'Business', year: 3, gpa: 3.1 },
  { id: 7, name: 'Olivia Taylor', major: 'Nursing', year: 4, gpa: 3.7 },
  { id: 8, name: 'Daniel Martinez', major: 'English', year: 1, gpa: 3.4 },
  { id: 9, name: 'Isabella Anderson', major: 'Art History', year: 2, gpa: 3.9 },
  { id: 10, name: 'William Thomas', major: 'Economics', year: 3, gpa: 3.0 }
];

// Memory store for real-time live mental health data
let liveStudentData = {};

// Initialize with safe baseline data
STUDENTS.forEach(student => {
  liveStudentData[student.id] = {
    student_id: student.id,
    name: student.name,
    major: student.major,
    attendance_rate: 95.0, // out of 100
    grades_trend: 0.0, // -1 to 1 (negative is dropping)
    sleep_hours_reported: 7.5,
    recent_life_events_score: 0, // 0 to 10 (higher is more negative events)
    system_logins_late_night: 1, // count of logins between 1 AM and 5 AM
    sentiment_score: 0.8, // -1 (negative) to 1 (positive)
    timestamp: new Date()
  };
});

// ==========================================
// 🧠 AI MENTAL HEALTH RISK PREDICTION ENGINE
// ==========================================
function calculateRisks(data) {
  // Risk factors
  // 1. Low attendance increases risk
  const attendanceRisk = Math.max(0, (90 - data.attendance_rate) / 30); // 0 risk if >= 90
  
  // 2. Dropping grades increases risk
  const gradesRisk = data.grades_trend < 0 ? Math.abs(data.grades_trend) : 0;
  
  // 3. Low sleep increases risk
  const sleepRisk = Math.max(0, (7 - data.sleep_hours_reported) / 4); // 0 risk if >= 7
  
  // 4. Negative sentiment increases risk
  const sentimentRisk = data.sentiment_score < 0 ? Math.abs(data.sentiment_score) : 0;
  
  // 5. Digital Exhaust: High late night logins
  const exhaustRisk = Math.min(data.system_logins_late_night / 10, 1);
  
  // 6. Recent life events
  const lifeEventRisk = data.recent_life_events_score / 10;

  // Calculate overall risk score
  const overallRisk = (
    attendanceRisk * 0.2 +
    gradesRisk * 0.15 +
    sleepRisk * 0.15 +
    sentimentRisk * 0.25 +
    exhaustRisk * 0.15 +
    lifeEventRisk * 0.1
  );

  let risk_level = 'Low';
  let ai_generated_insights = "Student is exhibiting stable baseline patterns. No immediate intervention required.";

  if (overallRisk > 0.75) {
    risk_level = 'Critical';
    ai_generated_insights = "Critical indicators detected: Severe combination of negative sentiment, poor attendance, and potential sleep deprivation (Digital Exhaust: High late-night activity). Immediate counselor outreach recommended.";
  } else if (overallRisk > 0.5) {
    risk_level = 'High';
    ai_generated_insights = "High risk indicators: Student shows dropping attendance and negative linguistic sentiment. Consider scheduling a routine check-in.";
  } else if (overallRisk > 0.25) {
    risk_level = 'Moderate';
    ai_generated_insights = "Moderate risk: Minor fluctuations in sleep or digital exhaust detected. Continue monitoring.";
  }

  return {
    risk_level,
    overall_risk_score: overallRisk,
    factors: {
      attendance_risk: attendanceRisk,
      grades_risk: gradesRisk,
      sleep_risk: sleepRisk,
      sentiment_risk: sentimentRisk,
      digital_exhaust_risk: exhaustRisk,
      life_event_risk: lifeEventRisk
    },
    ai_generated_insights
  };
}

// ==========================================
// 🚀 REST API ROUTES
// ==========================================
app.get("/", (req, res) => res.json({ status: "active", focus: "Mental Health Risk Engine", message: "Student Wellness Engine Running" }));
app.get("/api/students", (req, res) => res.json(STUDENTS));
app.get("/api/students/risk-assessments", (req, res) => res.json(Object.values(liveStudentData)));

app.get("/api/counselor/alerts", (req, res) => {
  const alerts = [];
  Object.values(liveStudentData).forEach(data => {
    const predictions = calculateRisks(data);
    if (predictions.risk_level === 'Critical') {
      alerts.push({ 
        id: Date.now() + Math.random(), 
        student_id: data.student_id,
        severity: 'CRITICAL', 
        message: `🚨 Critical Risk: ${data.name} is showing severe distress indicators.`, 
        timestamp: new Date() 
      });
    } else if (predictions.risk_level === 'High') {
      alerts.push({ 
        id: Date.now() + Math.random(), 
        student_id: data.student_id,
        severity: 'WARNING', 
        message: `⚠️ High Risk: ${data.name} has flagged for declining well-being.`, 
        timestamp: new Date() 
      });
    }
  });
  
  res.json(alerts.length ? alerts.sort((a,b) => b.timestamp - a.timestamp) : [{ id: 1, severity: 'INFO', message: 'All students are currently in stable status.', timestamp: new Date() }]);
});

app.post("/api/simulate-student-risk", (req, res) => {
  try {
    const { attendance_rate, grades_trend, sleep_hours_reported, sentiment_score, system_logins_late_night, recent_life_events_score } = req.body;
    
    const simulatedData = { 
        attendance_rate: Number(attendance_rate) || 95, 
        grades_trend: Number(grades_trend) || 0, 
        sleep_hours_reported: Number(sleep_hours_reported) || 7.5, 
        sentiment_score: Number(sentiment_score) || 0.5, 
        system_logins_late_night: Number(system_logins_late_night) || 1,
        recent_life_events_score: Number(recent_life_events_score) || 0
    };
    
    const predictions = calculateRisks(simulatedData);

    res.json({
      ...predictions,
      simulated_data: simulatedData,
      action_plan: predictions.risk_level === 'Critical' 
        ? "Action Plan: 1) Send immediate SMS check-in. 2) Schedule priority 1-on-1 counselor meeting. 3) Notify Resident Advisor." 
        : predictions.risk_level === 'High' 
        ? "Action Plan: 1) Send automated wellness resource email. 2) Flag for check-in next week." 
        : "No immediate action required."
    });
  } catch (error) {
    res.status(500).json({ error: "Simulation Engine Offline." });
  }
});

// ==========================================
// ⚡ REAL-TIME WEBSOCKET STREAM
// ==========================================
// Periodically simulate slight shifts in student data to demonstrate real-time capabilities
setInterval(() => {
  STUDENTS.forEach(student => {
    let current = liveStudentData[student.id];
    
    // Simulate slight natural variations
    current.sleep_hours_reported = Math.max(2, Math.min(10, (Number(current.sleep_hours_reported) + (Math.random() * 0.4 - 0.2)))).toFixed(1);
    current.sentiment_score = Math.max(-1, Math.min(1, (Number(current.sentiment_score) + (Math.random() * 0.1 - 0.05)))).toFixed(2);
    
    // Randomly spike digital exhaust for some students
    if (Math.random() > 0.95) {
        current.system_logins_late_night += 1;
    }
    
    current.timestamp = new Date();

    io.emit("studentUpdate", { student_id: student.id, data: current });
    io.emit("studentRiskUpdate", { student_id: student.id, prediction: calculateRisks(current) });
  });
}, 5000);

io.on("connection", (socket) => {
  console.log("🟢 Counselor Dashboard Connected:", socket.id);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Student Wellness AI Backend running on port ${PORT}`));