import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  Rocket, AlertTriangle, ShieldCheck, Activity, Wifi, 
  Settings, Battery, Zap, Thermometer, Compass, Maximize2
} from "lucide-react";

import ThreeJSViewer from "./components/ThreeJSViewer";
import TelemetryChart from "./components/TelemetryChart";

// Assuming we run backend locally on 10000 for this project
const API = "https://mental-health-risk.onrender.com";

interface TelemetryData {
  altitude: number;
  ybco_temperature: number;
  magnetic_flux: number;
  pitch: number;
  roll: number;
  yaw: number;
  timestamp: string;
}

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isCritical, setIsCritical] = useState(false);
  const [criticalMsg, setCriticalMsg] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(API, { transports: ["websocket", "polling"] });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('telemetry_stream', (data: TelemetryData) => {
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
          altitude: data.altitude,
          magnetic_flux: data.magnetic_flux
        };
        const updated = [...prev, latest];
        return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
      });
    });

    socket.on('CRITICAL_FAILURE_INITIATE_LANDING', (payload) => {
      setIsCritical(true);
      setCriticalMsg(payload.message);
      setTelemetry(payload.data); // Update with final data point
    });

    return () => { socket.disconnect(); };
  }, []);

  if (!telemetry) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-500 font-mono">
        <Activity className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p>INITIALIZING ANTI-GRAVITY PROTOCOLS...</p>
        <p className="text-xs mt-2 opacity-50">AWAITING TELEMETRY UPLINK</p>
      </div>
    );
  }

  // Helper formatting
  const formatVal = (val: number, decimals=1) => (val ?? 0).toFixed(decimals);

  return (
    <div className={`flex min-h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden ${isCritical ? 'glow-border-critical' : 'glow-border'} m-2 rounded-2xl`}>
      {/* Sci-Fi HUD Scanlines overlay */}
      <div className="hud-scanlines"></div>

      {/* ---------- SIDEBAR (Hardware Stats) ---------- */}
      <aside className="w-20 lg:w-72 border-r border-[#1e293b]/50 bg-[#0f172a]/90 flex flex-col justify-between shrink-0 z-20 backdrop-blur-md">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[#1e293b]/50">
            <div className={`w-10 h-10 rounded text-[#020617] flex items-center justify-center shadow-lg ${isCritical ? 'bg-red-500 shadow-red-500/50' : 'bg-cyan-400 shadow-cyan-400/30'}`}>
              <Rocket className="w-5 h-5" />
            </div>
            <span className="hidden lg:block ml-3 font-bold text-lg tracking-widest uppercase text-slate-200">
              AG-<span className={isCritical ? "text-red-500" : "text-cyan-400"}>SYS</span> 01
            </span>
          </div>

          <div className="p-4 space-y-6 hidden lg:block">
            {/* Vertical Systems Status */}
            <div>
              <h3 className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Settings className="w-3 h-3" /> Core Telemetry
              </h3>
              
              <div className="space-y-4">
                <div className="bg-[#020617]/50 p-3 rounded-lg border border-[#1e293b] relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                  <div className="flex justify-between items-end mb-1 relative z-10">
                    <span className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1"><Compass className="w-3 h-3 text-cyan-500"/> Altitude</span>
                    <span className="text-xl font-mono text-white">{formatVal(telemetry.altitude)}<span className="text-xs text-slate-500 ml-1">mm</span></span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden relative z-10">
                    <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (telemetry.altitude / 500) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#020617]/50 p-3 rounded-lg border border-[#1e293b] relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-end mb-1 relative z-10">
                    <span className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-500"/> Mag. Flux</span>
                    <span className="text-xl font-mono text-white">{formatVal(telemetry.magnetic_flux, 2)}<span className="text-xs text-slate-500 ml-1">T</span></span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden relative z-10">
                     <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (telemetry.magnetic_flux / 5) * 100)}%` }}></div>
                  </div>
                </div>

                <div className={`bg-[#020617]/50 p-3 rounded-lg border relative overflow-hidden transition-colors ${telemetry.ybco_temperature > 85 ? 'border-red-500/50' : 'border-[#1e293b]'}`}>
                  <div className="flex justify-between items-end mb-1 relative z-10">
                    <span className={`text-xs font-bold uppercase flex items-center gap-1 ${telemetry.ybco_temperature > 85 ? 'text-red-400' : 'text-slate-500'}`}><Thermometer className="w-3 h-3"/> YBCO Temp</span>
                    <span className={`text-xl font-mono ${telemetry.ybco_temperature > 85 ? 'text-red-400' : 'text-white'}`}>{formatVal(telemetry.ybco_temperature)}<span className="text-xs opacity-50 ml-1">K</span></span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden relative z-10">
                     <div className={`h-full ${telemetry.ybco_temperature > 90 ? 'bg-red-500 animate-pulse' : telemetry.ybco_temperature > 80 ? 'bg-amber-400' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, (telemetry.ybco_temperature / 120) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orientation */}
            <div className="mt-8">
              <h3 className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest mb-3">Gyroscopic State</h3>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#020617] border border-[#1e293b] p-2 rounded">
                  <div className="text-[9px] text-slate-500 mb-1">PITCH</div>
                  <div className="text-sm text-cyan-300">{formatVal(telemetry.pitch)}°</div>
                </div>
                <div className="bg-[#020617] border border-[#1e293b] p-2 rounded">
                  <div className="text-[9px] text-slate-500 mb-1">ROLL</div>
                  <div className="text-sm text-emerald-300">{formatVal(telemetry.roll)}°</div>
                </div>
                <div className="bg-[#020617] border border-[#1e293b] p-2 rounded">
                  <div className="text-[9px] text-slate-500 mb-1">YAW</div>
                  <div className="text-sm text-indigo-300">{formatVal(telemetry.yaw)}°</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </aside>

      {/* ---------- MAIN ---------- */}
      <main className="flex-1 flex flex-col relative z-20">
        
        {/* TOP STATUS BAR */}
        <header className="h-16 border-b border-[#1e293b]/80 px-6 flex items-center justify-between bg-[#0f172a]/50 backdrop-blur shrink-0">
           <div className="flex items-center gap-4">
              {isCritical ? (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded text-red-400 font-bold tracking-widest text-sm uppercase animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  <AlertTriangle className="w-4 h-4" />
                  CRITICAL - COOLING / STABILITY FAILURE
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded text-cyan-400 font-bold tracking-widest text-sm uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  STABLE LEVITATION
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-6 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">UPLINK</span>
                <Wifi className={`w-4 h-4 ${isConnected ? 'text-emerald-500' : 'text-slate-600'}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">PWR</span>
                <Battery className="w-4 h-4 text-emerald-500" />
                <span className="text-white">98%</span>
              </div>
              <div className="text-cyan-600 hidden md:block">
                 MSK_SYS_{new Date(telemetry.timestamp).getTime().toString().slice(-6)}
              </div>
           </div>
        </header>

        {/* Dynamic Alert Banner */}
        {isCritical && (
          <div className="bg-red-600 text-white font-mono p-2 text-center text-xs tracking-widest font-bold uppercase shadow-[0_4px_20px_rgba(220,38,38,0.4)] z-50">
            {criticalMsg} || AUTOMATED DESCENT PROTOCOL ENGAGED || EVACUATE PRIMARY CONTAINMENT CHAMBER
          </div>
        )}

        {/* CONTENT PANELS */}
        <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
            
            {/* 3D VIEWER PANEL */}
            <div className="md:w-1/2 lg:w-3/5 bg-[#0a0f1d]/80 rounded-xl border border-[#1e293b] shadow-inner relative flex flex-col group">
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 className="font-mono text-xs text-cyan-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 className="w-3 h-3" /> Containment Chamber Visualizer
                </h2>
              </div>
              <div className="flex-1 w-full relative">
                  <ThreeJSViewer telemetry={{ altitude: telemetry.altitude, pitch: telemetry.pitch, roll: telemetry.roll, yaw: telemetry.yaw }} isCritical={isCritical} />
              </div>
              {/* HUD Overlay Elements */}
              <div className="absolute right-4 bottom-4 text-right pointer-events-none p-2 border border-[#1e293b] bg-[#020617]/50 rounded backdrop-blur font-mono">
                 <div className="text-[10px] text-slate-500">Z-AXIS DISPLACEMENT</div>
                 <div className={`text-xl font-bold ${isCritical ? 'text-red-400' : 'text-blue-400'}`}>+{formatVal(telemetry.altitude, 1)}<span className="text-xs ml-1 font-normal opacity-50">mm</span></div>
              </div>
            </div>

            {/* DIAGNOSTICS & CHARTS PANEL */}
            <div className="md:w-1/2 lg:w-2/5 flex flex-col gap-4">
              
              <div className="flex-1 bg-[#0a0f1d]/80 rounded-xl border border-[#1e293b] p-4 relative overflow-hidden flex flex-col">
                 <h2 className="font-mono text-xs text-cyan-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
                  <Activity className="w-3 h-3" /> Live Telemetry Feed
                 </h2>
                 <div className="flex-1 min-h-[200px] w-full relative z-10">
                    <TelemetryChart data={chartData} isCritical={isCritical} />
                 </div>
                 <div className="absolute right-4 top-4 flex gap-3 text-[10px] font-mono font-bold">
                    <span className="text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> FLUX</span>
                    <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> ALT</span>
                 </div>
              </div>

              {/* RAW TERMINAL / LOGS */}
              <div className="h-48 bg-[#020617] rounded-xl border border-[#1e293b] p-4 font-mono text-xs overflow-y-auto custom-scrollbar shadow-inner relative">
                  <div className="sticky top-0 bg-[#020617] pb-2 border-b border-[#1e293b] mb-2 text-slate-500 flex justify-between">
                     <span>TERMINAL_OUTPUT</span>
                     <span>v2.4.1</span>
                  </div>
                  <div className="space-y-1">
                    {[...chartData].reverse().slice(0, 15).map((log, i) => (
                      <div key={i} className="flex gap-4 hover:bg-[#0f172a] p-1 rounded transition-colors group">
                        <span className="text-slate-600 shrink-0">[{log.time}]</span>
                        <span className="text-cyan-600 group-hover:text-cyan-400 transition-colors">DATA_RECV</span>
                        <span className="text-slate-400 truncate">
                          ALT:{formatVal(log.altitude)}mm FLUX:{formatVal(log.magnetic_flux)}T
                        </span>
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