import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { 
  HeartPulse, AlertTriangle, ShieldCheck, Activity, Wifi, 
  User, Brain, Moon, Clock, LineChart, ChevronRight, Users, 
  Settings, Lock, MessageSquare, ArrowLeft, ArrowUpRight
} from "lucide-react";

import TelemetryChart from "./components/TelemetryChart";

const API = "https://mental-health-risk.onrender.com/"; // Use Localhost if testing locally: "http://localhost:10000" (but keeping production URL for robust demo)

interface StudentRiskData {
  student_id: string;
  name: string;
  major: string;
  year: string;
  stress_level: number;
  sleep_hours: number;
  sentiment_score: number;
  screen_time_hours: number;
  risk_score: number;
  confidence_score: number;
  risk_level: string;
  ai_explanation: string[];
  recommendations: string[];
  timestamp: string;
}

export default function App() {
  const [students, setStudents] = useState<StudentRiskData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'privacy'>('dashboard');
  const [chartDataMap, setChartDataMap] = useState<Record<string, any[]>>({});
  const [criticalAlert, setCriticalAlert] = useState<{message: string, count: number} | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // For local testing vs production
    const socketUrl = window.location.hostname === "localhost" ? "http://localhost:10000" : API;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('counselor_dashboard_stream', (dataList: StudentRiskData[]) => {
      setStudents(dataList);
      
      // Update chart histories for each student
      setChartDataMap(prev => {
        const nextMap = { ...prev };
        dataList.forEach(st => {
          const timeStr = new Date(st.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const dp = { time: timeStr, stress: st.stress_level, sentiment: st.sentiment_score };
          
          if (!nextMap[st.student_id]) nextMap[st.student_id] = [];
          
          nextMap[st.student_id] = [...nextMap[st.student_id], dp];
          if (nextMap[st.student_id].length > 40) {
            nextMap[st.student_id] = nextMap[st.student_id].slice(-40);
          }
        });
        return nextMap;
      });
      
      // Clear alert organically if no one is HIGH risk
      if (!dataList.some(s => s.risk_level === 'HIGH')) {
        setCriticalAlert(null);
      }
    });

    socket.on('CRITICAL_RISK_INTERVENTION_REQUIRED', (payload) => {
      setCriticalAlert(prev => ({ 
        message: payload.message, 
        count: (prev?.count || 0) + 1 
      }));
    });

    return () => { socket.disconnect(); };
  }, []);

  const formatVal = (val: number, decimals=1) => (val ?? 0).toFixed(decimals);

  const selectedStudent = students.find(s => s.student_id === selectedStudentId);
  const chartData = selectedStudent ? (chartDataMap[selectedStudentId!] || []) : [];
  
  const highRiskCount = students.filter(s => s.risk_level === 'HIGH').length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-30 flex-shrink-0 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none"></div>
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 relative z-10">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm text-white ${highRiskCount > 0 ? 'bg-orange-500 shadow-orange-500/30' : 'bg-blue-600 shadow-blue-600/30'}`}>
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight text-slate-800">
              Mind<span className={highRiskCount > 0 ? "text-orange-500" : "text-blue-600"}>Guard</span>
            </span>
          </div>

          <nav className="p-3 space-y-1 mt-4 relative z-10">
            <button 
              onClick={() => { setActiveNav('dashboard'); setSelectedStudentId(null); }}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all font-medium text-sm ${activeNav === 'dashboard' && !selectedStudentId ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden lg:block">Counselor View</span>
            </button>

            {selectedStudentId && (
              <button 
                onClick={() => setActiveNav('dashboard')}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all font-medium text-sm ${activeNav === 'dashboard' && selectedStudentId ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
              >
                <Activity className="w-5 h-5" />
                <span className="hidden lg:block w-36 truncate text-left">{selectedStudent?.name || "Monitoring"}</span>
              </button>
            )}

            <button 
              onClick={() => setActiveNav('privacy')}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all font-medium text-sm ${activeNav === 'privacy' ? 'bg-slate-100 text-slate-800 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
            >
              <Lock className="w-5 h-5" />
              <span className="hidden lg:block">Privacy & Ethics</span>
            </button>
          </nav>
        </div>

        <div className="p-4 relative z-10 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
             </div>
             <div className="hidden lg:block flex-1 min-w-0">
               <div className="text-sm font-bold text-slate-800 truncate">Dr. Sarah Jenkins</div>
               <div className="text-xs text-slate-500 truncate">University Counselor</div>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0 z-30 shadow-sm">
           <div className="flex items-center gap-4">
              {highRiskCount > 0 ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full text-red-600 font-bold text-xs uppercase animate-pulse shadow-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {highRiskCount} PRIORITY {highRiskCount === 1 ? 'ALERT' : 'ALERTS'}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-emerald-600 font-bold text-xs uppercase shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  ALL COHORTS STABLE
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="tracking-wider">AI SENSOR STREAM</span>
                <Wifi className={`w-4 h-4 ${isConnected ? 'text-blue-500' : 'text-slate-300'}`} />
              </div>
           </div>
        </header>

        {/* Dynamic Critical Alert Banner */}
        {criticalAlert && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2.5 text-center text-xs font-bold uppercase shadow-md z-40 flex items-center justify-center gap-3 animate-slide-up">
            <AlertTriangle className="w-4 h-4" />
            {criticalAlert.message} • INTERVENTION PROTOCOLS ACTIVE
          </div>
        )}

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          
          {/* VIEW: PRIVACY */}
          {activeNav === 'privacy' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
               <div className="glass-card rounded-2xl p-8">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Lock className="w-8 h-8" /></div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">Privacy & Ethical AI Principles</h1>
                      <p className="text-slate-500">University Compliance & Data Protection</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6 text-slate-600 leading-relaxed">
                   <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Data Anonymization</h3>
                     <p className="text-sm">All telemetry streams are fully anonymized at the source sensor level. Predictive processing occurs within encrypted enclaves. Identifiable information is only decrypted and visible to certified psychological counselors when a "High Risk" threshold triggers an intervention mandate.</p>
                   </div>
                   
                   <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-2"><Brain className="w-5 h-5 text-indigo-500" /> Explainable Inference Model</h3>
                     <p className="text-sm">The MindGuard predictive model avoids "black box" decisions. Every calculated risk score provides a transparent, plaintext breakdown of the exact behavioral metrics (sleep duration, digital sentiment) that contributed to the automated classification. This ensures counselor oversight over AI suggestions.</p>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* VIEW: COUNSELOR DASHBOARD (List) */}
          {activeNav === 'dashboard' && !selectedStudentId && (
            <div className="max-w-6xl mx-auto animate-fade-in pb-10">
               <h1 className="text-2xl font-bold text-slate-800 mb-2">Cohort Overview</h1>
               <p className="text-slate-500 mb-8">Monitoring {students.length} students across behavioral arrays. Ranked by real-time risk severity.</p>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {students.map(student => (
                   <div 
                     key={student.student_id} 
                     onClick={() => setSelectedStudentId(student.student_id)}
                     className={`rounded-2xl border p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${student.risk_level === 'HIGH' ? 'glass-critical' : student.risk_level === 'MODERATE' ? 'glass-card border-orange-200' : 'glass-card border-slate-200'}`}
                   >
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                           {student.name}
                           {student.risk_level === 'HIGH' && <AlertTriangle className="w-4 h-4 text-red-500 fill-current animate-pulse" />}
                         </div>
                         <div className="text-xs text-slate-500">{student.year} • {student.major}</div>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-xs font-bold border ${student.risk_level === 'HIGH' ? 'bg-red-50 border-red-200 text-red-600' : student.risk_level === 'MODERATE' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                         {student.risk_score.toFixed(0)} RISK
                       </div>
                     </div>

                     <div className="space-y-3 mt-6">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 flex items-center gap-2"><Brain className="w-4 h-4 text-blue-400" /> Stress</span>
                         <span className="font-semibold">{student.stress_level.toFixed(0)}</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className={`h-full ${student.stress_level > 70 ? 'bg-orange-400' : 'bg-blue-400'}`} style={{ width: `${student.stress_level}%` }}></div>
                       </div>

                       <div className="flex justify-between items-center text-sm pt-2">
                         <span className="text-slate-500 flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-400" /> Sleep</span>
                         <span className="font-semibold">{student.sleep_hours.toFixed(1)}h</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className={`h-full ${student.sleep_hours < 5 ? 'bg-red-400' : 'bg-indigo-400'}`} style={{ width: `${(student.sleep_hours / 10) * 100}%` }}></div>
                       </div>
                     </div>
                     
                     <div className="mt-6 pt-4 border-t border-slate-100/50 flex justify-end">
                       <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">View Analytics <ChevronRight className="w-3 h-3" /></span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* VIEW: STUDENT DETAILS (Selected) */}
          {activeNav === 'dashboard' && selectedStudent && (
            <div className="max-w-6xl mx-auto animate-fade-in pb-20">
              
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="flex flex-col lg:flex-row gap-6">
                 
                 {/* LEFT COLUMN: Overview & Explainable AI */}
                 <div className="w-full lg:w-1/3 space-y-6">
                    
                    {/* Identity Card */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200">
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                           {selectedStudent.name.charAt(0)}
                         </div>
                         <div>
                           <h2 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h2>
                           <p className="text-sm text-slate-500">ID: {selectedStudent.student_id} • {selectedStudent.year}</p>
                         </div>
                       </div>

                       {/* Risk Gauge Simulation */}
                       <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Risk Score</div>
                          <div className={`text-5xl font-black mb-1 ${selectedStudent.risk_level === 'HIGH' ? 'text-red-500' : selectedStudent.risk_level === 'MODERATE' ? 'text-orange-500' : 'text-emerald-500'}`}>
                             {selectedStudent.risk_score.toFixed(0)}
                          </div>
                          <div className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${selectedStudent.risk_level === 'HIGH' ? 'bg-red-100 border-red-200 text-red-700' : selectedStudent.risk_level === 'MODERATE' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                             {selectedStudent.risk_level} RISK
                          </div>
                       </div>
                    </div>

                    {/* Explainable AI Panel */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <Brain className="w-4 h-4 text-indigo-500" /> Explainable AI Analysis
                      </h3>
                      <ul className="space-y-3">
                         {selectedStudent.ai_explanation.map((exp, i) => (
                           <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600">
                             <div className="mt-0.5"><Activity className={`w-4 h-4 ${selectedStudent.risk_level === 'HIGH' ? 'text-red-400' : 'text-blue-400'}`} /></div>
                             <span>{exp}</span>
                           </li>
                         ))}
                      </ul>
                      <div className="mt-4 text-xs font-semibold text-slate-400 flex items-center gap-1.5 justify-end">
                         AI Model Confidence: <span className="text-slate-600">{selectedStudent.confidence_score.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Suggested Interventions
                      </h3>
                      <div className="space-y-3">
                         {selectedStudent.recommendations.map((rec, i) => (
                           <button key={i} className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium hover:shadow-md ${selectedStudent.risk_level === 'HIGH' ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100' : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'}`}>
                             <span>{rec}</span>
                             <ChevronRight className="w-4 h-4 opacity-50" />
                           </button>
                         ))}
                      </div>
                    </div>

                 </div>

                 {/* RIGHT COLUMN: Analytics & Chatbot */}
                 <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    
                    {/* Main Telemetry Chart */}
                    <div className="h-96 glass-card rounded-2xl p-6 border border-slate-200 flex flex-col relative">
                       <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                         <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                           <LineChart className="w-4 h-4 text-blue-500" /> Behavioral Time Series
                         </h3>
                         <div className="flex gap-4 text-xs font-bold px-3 py-1.5 rounded border border-slate-100 bg-slate-50">
                            <span className="text-slate-600 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${selectedStudent.risk_level === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></span> STRESS
                            </span>
                            <span className="text-slate-600 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${selectedStudent.risk_level === 'HIGH' ? 'bg-red-400' : 'bg-emerald-500'}`}></span> SENTIMENT
                            </span>
                         </div>
                       </div>
                       
                       <div className="flex-1 w-full relative z-10">
                          <TelemetryChart data={chartData} isCritical={selectedStudent.risk_level === 'HIGH'} />
                       </div>
                    </div>

                    {/* Additional Metrics Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                          <Clock className="w-6 h-6 text-slate-400 mb-2" />
                          <div className="text-xl font-bold text-slate-700">{formatVal(selectedStudent.screen_time_hours)}<span className="text-xs text-slate-400 ml-1">hrs</span></div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Screen Time</div>
                       </div>
                       <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                          <Moon className="w-6 h-6 text-indigo-400 mb-2" />
                          <div className="text-xl font-bold text-slate-700">{formatVal(selectedStudent.sleep_hours)}<span className="text-xs text-slate-400 ml-1">hrs</span></div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">REM Sleep</div>
                       </div>
                       <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                          <Activity className="w-6 h-6 text-emerald-400 mb-2" />
                          <div className="text-xl font-bold text-slate-700">{formatVal(selectedStudent.sentiment_score, 2)}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">NLP Sentiment</div>
                       </div>
                       <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                          <Brain className="w-6 h-6 text-red-400 mb-2" />
                          <div className="text-xl font-bold text-slate-700">{formatVal(selectedStudent.stress_level)}<span className="text-xs text-slate-400 ml-1">idx</span></div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Stress Index</div>
                       </div>
                    </div>

                    {/* Wellness Chatbot Interaction Simulation Panel */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200 flex gap-6">
                       <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                         <MessageSquare className="w-6 h-6 text-indigo-600" />
                       </div>
                       <div>
                         <h3 className="text-sm font-bold text-slate-800 mb-1">Student Wellness Assistant status</h3>
                         <p className="text-sm text-slate-500 mb-4">The automated conversational AI is currently available for {selectedStudent.name}. Last interaction: <span className="font-semibold text-slate-600">3 hours ago</span>.</p>
                         <button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                           Review Chat Logs
                         </button>
                       </div>
                    </div>

                 </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}