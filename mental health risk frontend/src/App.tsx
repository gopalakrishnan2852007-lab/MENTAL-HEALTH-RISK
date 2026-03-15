import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  HeartPulse, AlertTriangle, ShieldCheck, Activity, Wifi, 
  User, Battery, Brain, Moon, Clock, LineChart
} from "lucide-react";

import ThreeJSViewer from "./components/ThreeJSViewer";
import TelemetryChart from "./components/TelemetryChart";

// Explicitly point frontend socket connection to the Render backend URL
const API = "https://mental-health-risk.onrender.com/";

interface StudentRiskData {
  stress_level: number;
  sleep_hours: number;
  sentiment_score: number;
  screen_time_hours: number;
  timestamp: string;
}

export default function App() {
  const [telemetry, setTelemetry] = useState<StudentRiskData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isCritical, setIsCritical] = useState(false);
  const [criticalMsg, setCriticalMsg] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(API, { transports: ["websocket", "polling"] });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('mental_health_stream', (data: StudentRiskData) => {
      // Normal operation overrides critical if it comes back to normal
      if (isCritical) {
         setIsCritical(false);
         setCriticalMsg("");
      }
      
      setTelemetry(data);
      
      setChartData(prev => {
        const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 1 });
        const latest = {
          time: timeStr,
          stress: data.stress_level,
          sentiment: data.sentiment_score
        };
        const updated = [...prev, latest];
        return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
      });
    });

    socket.on('CRITICAL_RISK_INTERVENTION_REQUIRED', (payload) => {
      setIsCritical(true);
      setCriticalMsg(payload.message);
      setTelemetry(payload.data); // Update with final data point
    });

    return () => { socket.disconnect(); };
  }, []);

  if (!telemetry) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-sans">
        <Activity className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="font-semibold text-lg text-slate-700">INITIALIZING AI RISK DETECTION...</p>
        <p className="text-sm mt-2 opacity-50">AWAITING SECURE UPLINK</p>
      </div>
    );
  }

  // Helper formatting
  const formatVal = (val: number, decimals=1) => (val ?? 0).toFixed(decimals);

  return (
    <div className={`flex min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden transition-colors duration-500 m-2 rounded-2xl border ${isCritical ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'border-slate-200'}`}>
      
      {/* ---------- SIDEBAR (Student Profile Overview) ---------- */}
      <aside className="w-20 lg:w-72 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 z-20 shadow-sm">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${isCritical ? 'bg-orange-500' : 'bg-blue-600'}`}>
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="hidden lg:block ml-3 font-bold text-lg text-slate-800">
              Mind<span className={isCritical ? "text-orange-500" : "text-blue-600"}>Guard</span> AI
            </span>
          </div>

          <div className="p-5 space-y-6 hidden lg:block">
            {/* Target Profile Identity */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
               <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <User className="text-slate-400 w-6 h-6 mt-1" />
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-800">Student ID: #99014</div>
                  <div className="text-xs text-slate-500">Sophomore • Psychology</div>
               </div>
            </div>

            {/* Vertical Systems Status */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Real-Time Health Metrics
              </h3>
              
              <div className="space-y-4">
                {/* Stress Level */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 relative overflow-hidden group hover:border-blue-300 transition-colors shadow-sm">
                  <div className="flex justify-between items-end mb-1 relative z-10">
                    <span className="text-xs text-slate-600 font-bold uppercase flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-blue-500"/> Stress Level</span>
                    <span className={`text-xl font-bold ${telemetry.stress_level > 80 ? 'text-red-500' : 'text-slate-800'}`}>{formatVal(telemetry.stress_level)}<span className="text-xs text-slate-400 ml-1">idx</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden relative z-10">
                    <div className={`h-full ${telemetry.stress_level > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, telemetry.stress_level)}%` }}></div>
                  </div>
                </div>

                {/* Sleep Hours */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 relative overflow-hidden group hover:border-indigo-300 transition-colors shadow-sm">
                  <div className="flex justify-between items-end mb-1 relative z-10">
                    <span className="text-xs text-slate-600 font-bold uppercase flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-indigo-500"/> REM Sleep</span>
                    <span className={`text-xl font-bold ${telemetry.sleep_hours < 5 ? 'text-orange-500' : 'text-slate-800'}`}>{formatVal(telemetry.sleep_hours, 1)}<span className="text-xs text-slate-400 ml-1">hrs</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden relative z-10">
                     <div className={`h-full ${telemetry.sleep_hours < 5 ? 'bg-orange-400' : 'bg-indigo-400'}`} style={{ width: `${Math.min(100, (telemetry.sleep_hours / 10) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Sentiment Score */}
                <div className={`bg-white p-3 rounded-lg border shadow-sm transition-colors ${telemetry.sentiment_score < -0.5 ? 'border-orange-300 bg-orange-50/50' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-end mb-1 relative z-10">
                    <span className="text-xs text-slate-600 font-bold uppercase flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500"/> Sentiment NLP</span>
                    <span className={`text-xl font-bold ${telemetry.sentiment_score < 0 ? 'text-orange-500' : 'text-emerald-600'}`}>{formatVal(telemetry.sentiment_score, 2)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden flex relative z-10">
                     {/* Bipolar bar: center is 0. Left is negative, right is positive. */}
                     <div className="w-1/2 h-full flex justify-end">
                        {telemetry.sentiment_score < 0 && <div className="h-full bg-orange-400" style={{ width: `${Math.abs(telemetry.sentiment_score) * 100}%` }}></div>}
                     </div>
                     <div className="w-1/2 h-full flex justify-start border-l border-white/50">
                        {telemetry.sentiment_score > 0 && <div className="h-full bg-emerald-400" style={{ width: `${telemetry.sentiment_score * 100}%` }}></div>}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Time */}
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Behaviors</h3>
              <div className="grid grid-cols-1 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center transition-all hover:bg-slate-100/50">
                  <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> SCREEN TIME</div>
                  <div className="text-lg font-bold text-slate-700">{formatVal(telemetry.screen_time_hours)}<span className="text-xs ml-1 font-normal text-slate-400">h</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </aside>

      {/* ---------- MAIN DASHBOARD ---------- */}
      <main className="flex-1 flex flex-col relative z-20 overflow-y-auto">
        
        {/* TOP STATUS BAR */}
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-4">
              {isCritical ? (
                <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-full text-orange-600 font-bold text-xs uppercase animate-pulse shadow-sm">
                  <AlertTriangle className="w-4 h-4" />
                  INTERVENTION REQUIRED
                </div>
              ) : (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-emerald-600 font-bold text-xs uppercase shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  STUDENT STATE STABLE
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-6 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">STREAMING</span>
                <Wifi className={`w-4 h-4 ${isConnected ? 'text-blue-500' : 'text-slate-300'}`} />
              </div>
              <div className="text-slate-400 hidden md:block border-l border-slate-200 pl-6">
                 Session ID: {new Date(telemetry.timestamp).getTime().toString().slice(-6)}
              </div>
           </div>
        </header>

        {/* Dynamic Alert Banner */}
        {isCritical && (
          <div className="bg-orange-500 text-white p-3 text-center text-sm font-semibold uppercase shadow-md z-40 animate-[slideDown_0.3s_ease-out]">
            {criticalMsg} • INITIATING COUNSELOR OUTREACH PROTOCOLS
          </div>
        )}

        {/* CONTENT PANELS */}
        <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
            
            {/* 3D VIEWER PANEL (Optional placeholder for clinical view or Avatar) */}
            <div className="lg:w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm relative flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Behavioral Metrics Overview
                </h2>
              </div>
              <div className="flex-1 w-full relative p-6 flex flex-col items-center justify-center">
                  
                  {/* Calming visual element logic (replacing 3D for performance/suitability, using CSS pulsing nodes) */}
                   <div className="relative w-48 h-48 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${isCritical ? 'bg-orange-500' : 'bg-blue-400'}`} style={{ animationDuration: '3s' }}></div>
                      <div className={`absolute inset-4 rounded-full opacity-40 animate-ping ${isCritical ? 'bg-orange-500' : 'bg-blue-400'}`} style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                      <div className={`w-24 h-24 rounded-full shadow-xl flex items-center justify-center relative z-10 transition-colors duration-700 ${isCritical ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                         <Brain className="w-10 h-10 text-white opacity-90" />
                      </div>
                   </div>

                  <div className="mt-10 text-center space-y-2">
                    <div className="text-2xl font-bold text-slate-800 tracking-tight">
                       {telemetry.stress_level > 80 ? 'Elevated Risk' : 'Baseline'}
                    </div>
                    <p className="text-sm text-slate-500 px-4">
                       Active monitoring of student sentiment, digital behavior, and sleep patterns.
                    </p>
                  </div>

              </div>
            </div>

            {/* DIAGNOSTICS & CHARTS PANEL */}
            <div className="lg:w-2/3 flex flex-col gap-6">
              
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative flex flex-col">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-slate-400" /> Risk Factor Trending
                   </h2>
                   <div className="flex gap-4 text-xs font-bold bg-slate-50 py-1.5 px-3 rounded-md border border-slate-100">
                      <span className="text-slate-600 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-blue-200 bg-blue-500"></span> STRESS LEVEL</span>
                      <span className="text-slate-600 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-emerald-200 bg-emerald-500"></span> SENTIMENT</span>
                   </div>
                 </div>
                 
                 <div className="flex-1 min-h-[300px] w-full relative z-10">
                    <TelemetryChart data={chartData} isCritical={isCritical} />
                 </div>
              </div>

              {/* RAW TERMINAL / LOGS - Transformed into Activity Feed */}
              <div className="h-56 bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden flex flex-col">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                     <span>Recent Event Feed</span>
                     <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">Live</span>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {[...chartData].reverse().slice(0, 15).map((log, i) => (
                      <div key={i} className="flex gap-4 hover:bg-slate-50 p-2 rounded-lg transition-colors group text-sm border border-transparent hover:border-slate-100">
                        <span className="text-slate-400 font-mono text-xs w-20 shrink-0 mt-0.5">{log.time}</span>
                        <div className="flex flex-col">
                           <span className="text-slate-700 font-medium">Metric Update</span>
                           <span className="text-slate-500 text-xs">
                             Stress index recorded at <span className="font-semibold text-slate-700">{formatVal(log.stress)}</span> • Sentiment shifted to <span className="font-semibold text-slate-700">{formatVal(log.sentiment)}</span>
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

            </div>

        </div>
      </main>
    </div>
  );
}