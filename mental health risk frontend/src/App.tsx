import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  Activity, AlertTriangle, Bell, ShieldCheck,
  TrendingUp, Clock, Wifi, Moon, BookOpen, AlertCircle,
  Users, ActivitySquare, Brain, Search, Frown, Sparkles
} from "lucide-react";

import RiskTimelineChart from "./components/RiskTimelineChart";
import AIChatAssistant from "./components/AIChatAssistant";
import CommunityReportModal from "./components/CommunityReportModal";
import NewsTicker from "./components/NewsTicker";

// Dynamic API detection
const API = "http://localhost:10000";

interface StudentData {
  student_id: number;
  name: string;
  major: string;
  year?: number;
  sleep_hours_reported: string | number;
  attendance_rate: string | number;
  sentiment_score: string | number;
  system_logins_late_night: number;
}

interface RiskPrediction {
  risk_level: string;
  overall_risk_score: number;
  ai_generated_insights?: string;
  action_plan?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Realtime Data State
  const [studentData, setStudentData] = useState<Record<string, StudentData>>({});
  const [riskData, setRiskData] = useState<Record<string, RiskPrediction>>({});
  const [timelineData, setTimelineData] = useState<{time: string, avgStress: number}[]>([]);

  // Simulation State
  const [simAttendance, setSimAttendance] = useState(90);
  const [simGrades, setSimGrades] = useState(0);
  const [simSleep, setSimSleep] = useState(7.5);
  const [simSentiment, setSimSentiment] = useState(0.5);
  const [simExhaust, setSimExhaust] = useState(1);
  const [simLifeEvents, setSimLifeEvents] = useState(0);
  
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API}/api/simulate-student-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance_rate: simAttendance,
          grades_trend: simGrades,
          sleep_hours_reported: simSleep,
          sentiment_score: simSentiment,
          system_logins_late_night: simExhaust,
          recent_life_events_score: simLifeEvents
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [dataRes, alertsRes] = await Promise.all([
          fetch(`${API}/api/students/risk-assessments`).catch(() => null),
          fetch(`${API}/api/counselor/alerts`).catch(() => null)
        ]);

        if (dataRes && dataRes.ok) {
          const latestData = await dataRes.json();
          const studentsMap = {};
          latestData.forEach((item) => { studentsMap[item.student_id] = item; });
          setStudentData(studentsMap);
        }

        if (alertsRes && alertsRes.ok) {
          const latestAlerts = await alertsRes.json();
          setAlerts(latestAlerts);
        }
      } catch (e) { console.error("Failed to fetch initial data", e); }
    };

    fetchInitialData();

    const socket = io(API, { transports: ["websocket", "polling"] });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('studentUpdate', (payload) => {
      setStudentData(prev => ({
        ...prev,
        [payload.student_id]: { ...prev[payload.student_id], ...payload.data }
      }));
    });

    socket.on('studentRiskUpdate', (payload) => {
      setRiskData(prev => ({ ...prev, [payload.student_id]: payload.prediction }));

      setTimelineData(prev => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Calculate average campus stress
        let totalStress = 0;
        let count = 0;
        
        // This calculates risk across all current known predictions, plus the new one
        const currentRisks = { ...riskData, [payload.student_id]: payload.prediction };
        
        Object.values(currentRisks).forEach((pred: any) => {
           totalStress += pred.overall_risk_score * 100;
           count++;
        });

        const latest = {
          time: timeStr,
          avgStress: count > 0 ? (totalStress / count) : 0,
        };
        const updated = [...prev, latest];
        return updated.length > 15 ? updated.slice(updated.length - 15) : updated;
      });
    });

    socket.on('new_alert', (payload) => {
      setAlerts(prev => [payload, ...prev].slice(0, 50));
    });

    return () => socket.disconnect();
  }, [riskData]); // Added riskData to dependency array for accurate timeline calculation

  const previousAlertCount = useRef(0);
  useEffect(() => {
    if (alerts.length > previousAlertCount.current && alerts.length > 0) {
      const latestAlert = alerts[0];
      try {
        // Use a softer notification sound for the mental health context
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.3; audio.play().catch(() => { });
      } catch (e) { }
    }
    previousAlertCount.current = alerts.length;
  }, [alerts]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calcAvg = (key: keyof StudentData, defaultVal: string) => {
    const keys = Object.keys(studentData);
    if (keys.length === 0) return defaultVal;
    let validCount = 0;
    const sum = keys.reduce((acc, k) => {
      // @ts-ignore
      const val = Number(studentData[k]?.[key]);
      if (!isNaN(val)) { validCount++; return acc + val; }
      return acc;
    }, 0);
    return validCount === 0 ? defaultVal : (sum / validCount).toFixed(1);
  };

  const highRiskStudents = Object.values(studentData).filter(student => {
    const riskInfo = riskData[student.student_id];
    return riskInfo && (riskInfo.risk_level === 'High' || riskInfo.risk_level === 'Critical');
  });

  const getRiskColor = (level) => {
      if (level === 'Critical') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      if (level === 'High') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      if (level === 'Moderate') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const metrics = [
    {
      id: "sleep", label: "Avg Reported Sleep",
      value: calcAvg("sleep_hours_reported", "0.0"), unit: "hrs",
      icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20"
    },
    {
      id: "attendance", label: "Avg Attendance",
      value: calcAvg("attendance_rate", "0.0"), unit: "%",
      icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"
    },
    {
      id: "sentiment", label: "Avg Sentiment Score",
      value: calcAvg("sentiment_score", "0.0"), unit: " (-1 to 1)",
      icon: ActivitySquare, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20"
    },
    {
      id: "risk", label: "High Risk Students",
      value: highRiskStudents.length, unit: "",
      icon: AlertCircle, color: highRiskStudents.length > 0 ? "text-amber-500" : "text-emerald-500", bg: highRiskStudents.length > 0 ? "bg-amber-500/10" : "bg-emerald-500/10", border: highRiskStudents.length > 0 ? "border-amber-500/20" : "border-emerald-500/20"
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-y-auto">
      {/* ---------- SIDEBAR ---------- */}
      <aside className="w-20 lg:w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="hidden lg:block ml-3 font-bold text-lg text-slate-800">
              Mind<span className="text-blue-600">Guard</span> AI
            </span>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard", icon: Users, label: "Counselor Dashboard" },
              { id: "directory", icon: Search, label: "Student Directory" },
              { id: "alerts", icon: AlertCircle, label: "Intervention Alerts" },
              { id: "simulation", icon: Sparkles, label: "Risk Simulation Engine" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start lg:px-4 py-3 rounded-xl transition-all duration-300
                ${activeTab === item.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block ml-3">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ---------- MAIN ---------- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* HEADER */}
        <header className="h-20 border-b border-slate-200 px-6 flex items-center justify-between z-10 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-slate-800 hidden md:block capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-100 border border-slate-200 px-4 py-2 rounded-full shadow-inner tracking-wide">
              <Clock className="w-4 h-4 text-blue-600" />
              {currentTime}
            </div>
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border shadow-sm font-medium ${isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <Wifi className="w-3 h-3" />
              {isConnected ? 'SYSTEM ACTIVE' : 'OFFLINE'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors" onClick={() => setActiveTab('alerts')}>
              <Bell className="w-5 h-5 text-slate-600" />
              {alerts.length > 0 && alerts[0].severity !== 'INFO' && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => alert("Counselor settings module loading...")}
              className="px-5 py-2 bg-blue-600 text-white text-sm rounded-full font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              Counselor Settings
            </button>
          </div>
        </header>

        {/* ---------- CONTENT ---------- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map(m => (
                  <div key={m.id} className={`bg-white border ${m.border} rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-default relative overflow-hidden`}>
                    <div className="flex justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center border border-slate-100`}>
                        <m.icon className={`w-6 h-6 ${m.color}`} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{m.label}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <h2 className="text-4xl font-bold text-slate-800 transition-all">{m.value}</h2>
                      <span className="text-slate-500 font-medium">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CHARTS & ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> Overall Campus Stress Index
                  </h3>
                  <div className="h-[300px]">
                      {/* We will update RiskTimelineChart to be generic in the next steps */}
                      <RiskTimelineChart data={timelineData} />
                  </div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-500" /> High Priority Students
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {highRiskStudents.length > 0 ? (
                      highRiskStudents.map((student: any) => {
                          const riskInfo: any = riskData[student.student_id] || { risk_level: 'Unknown' };
                          const colorClasses = getRiskColor(riskInfo.risk_level);
                          
                          return (
                            <div key={student.student_id} className={`p-4 rounded-2xl border bg-white shadow-sm shrink-0 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden`}>
                              <div className={`absolute left-0 top-0 bottom-0 w-2 ${riskInfo.risk_level === 'Critical' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                              <div className="pl-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">{student.name}</h4>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClasses}`}>
                                        {riskInfo.risk_level}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium mb-2">{student.major} • Year {student.year}</p>
                                  <div className="text-xs text-slate-600 line-clamp-2">
                                      {riskInfo.ai_generated_insights || "Analyzing data..."}
                                  </div>
                              </div>
                            </div>
                          )
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <ShieldCheck className="w-12 h-12 text-emerald-500/30 mb-3" />
                        <p className="text-sm font-medium">No high priority students currently.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">Student Profiles & Risk Factors</h2>
                  <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Search students..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium sticky left-0 bg-slate-50">Student</th>
                      <th className="px-6 py-4 font-medium">Risk Status</th>
                      <th className="px-6 py-4 font-medium">Sleep (hrs)</th>
                      <th className="px-6 py-4 font-medium">Attendance</th>
                      <th className="px-6 py-4 font-medium">Sentiment</th>
                      <th className="px-6 py-4 font-medium">Late Night Logins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.values(studentData).map((student: any) => {
                        const riskInfo: any = riskData[student.student_id] || { risk_level: 'Loading...', overall_risk_score: 0 };
                        return (
                          <tr key={student.student_id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                            <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50">
                                <div className="font-semibold text-slate-800">{student.name}</div>
                                <div className="text-slate-500 text-xs">{student.major}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRiskColor(riskInfo.risk_level)}`}>
                                    {riskInfo.risk_level}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{Number(student.sleep_hours_reported).toFixed(1)}</td>
                            <td className="px-6 py-4 text-slate-600">{Number(student.attendance_rate).toFixed(1)}%</td>
                            <td className="px-6 py-4 text-slate-600">{Number(student.sentiment_score).toFixed(2)}</td>
                            <td className="px-6 py-4 text-slate-600">{student.system_logins_late_night}</td>
                          </tr>
                        )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="h-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 shrink-0">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                  Intervention Alerts
                </h2>
                <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Total: {alerts.length}</div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {alerts.length > 0 && alerts[0].severity !== 'INFO' ? (
                  alerts.map((alert, index) => (
                    <div key={alert.id || index} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-4 ${alert.severity === 'CRITICAL' ? 'bg-purple-50 border-purple-200' : alert.severity === 'WARNING' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${alert.severity === 'CRITICAL' ? 'bg-purple-100 text-purple-700' : alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {alert.severity}
                          </span>
                          <span className="text-sm text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium">{alert.message}</p>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${alert.severity === 'CRITICAL' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
                          View Action Plan
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                    <ShieldCheck className="w-20 h-20 text-emerald-500/20 mb-4" />
                    <p className="text-lg font-medium text-slate-600">No active intervention alerts.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="h-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-800">
                <Sparkles className="w-6 h-6 text-blue-600" />
                Student Risk Scenario Simulator
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <p className="text-slate-500 text-sm font-medium">
                    Adjust behavioral parameters below to see how the AI engine assesses risk and generates action plans.
                  </p>

                  <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div>
                      <label className="flex justify-between text-sm mb-2 font-semibold"><span className="text-slate-700">Attendance Rate</span><span className="text-emerald-600">{simAttendance}%</span></label>
                      <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" min="0" max="100" value={simAttendance} onChange={(e) => setSimAttendance(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm mb-2 font-semibold"><span className="text-slate-700">Sleep Hours (Nightly)</span><span className="text-indigo-600">{simSleep} hrs</span></label>
                      <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" min="0" max="12" step="0.5" value={simSleep} onChange={(e) => setSimSleep(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm mb-2 font-semibold"><span className="text-slate-700">Sentiment Score (Journaling/Chatbot)</span><span className="text-blue-600">{simSentiment}</span></label>
                      <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" min="-1" max="1" step="0.1" value={simSentiment} onChange={(e) => setSimSentiment(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm mb-2 font-semibold"><span className="text-slate-700">Grades Trend</span><span className="text-red-500">{simGrades}</span></label>
                      <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" min="-1" max="1" step="0.1" value={simGrades} onChange={(e) => setSimGrades(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm mb-2 font-semibold">
                          <span className="text-slate-700">Digital Exhaust (Late Night Logins)</span>
                          <span className="text-amber-600">{simExhaust} logins</span>
                      </label>
                      <p className="text-xs text-slate-500 mb-2">Simulates tracking LMS access between 1 AM - 5 AM</p>
                      <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" min="0" max="10" value={simExhaust} onChange={(e) => setSimExhaust(Number(e.target.value))} />
                    </div>
                    <button onClick={runSimulation} disabled={isSimulating} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex justify-center items-center">
                      {isSimulating ? <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" /> : 'Run AI Assessment'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden h-full">
                  <div className="relative text-center w-full z-10 flex flex-col h-full">
                    {simResult ? (
                      <div className="flex-1 flex flex-col">
                        <div className="mb-6 flex-shrink-0">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getRiskColor(simResult.risk_level)}`}>
                                {simResult.risk_level} Risk Level
                            </span>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left mb-6 flex-shrink-0">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-blue-500" /> AI Insights
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {simResult.ai_generated_insights}
                            </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left flex-1">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <ActivitySquare className="w-4 h-4 text-emerald-500" /> Suggested Action Plan
                            </h4>
                            <div className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {simResult.action_plan}
                            </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                        <Search className="w-16 h-16 text-blue-500/20 mb-4" />
                        <p className="text-sm font-medium px-8 text-slate-500">Adjust the parameters on the left to simulate a student profile and view the AI generated assessment and action plan.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AIChatAssistant />
      <CommunityReportModal isOpen={false} onClose={() => { }} />
    </div>
  );
}