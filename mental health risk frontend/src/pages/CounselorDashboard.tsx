import React, { useState } from 'react';
import { 
  Users, Brain, Moon, ChevronRight, Activity, ArrowLeft, 
  LineChart, Clock, MessageSquare, ArrowUpRight, AlertTriangle
} from "lucide-react";
import TelemetryChart from "../components/TelemetryChart";
import { StudentRiskData } from "../types";

interface CounselorDashboardProps {
  students: StudentRiskData[];
  chartDataMap: Record<string, any[]>;
}

export default function CounselorDashboard({ students, chartDataMap }: CounselorDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const formatVal = (val: number, decimals = 1) => (val ?? 0).toFixed(decimals);
  const selectedStudent = students.find(s => s.student_id === selectedStudentId);
  const chartData = selectedStudent ? (chartDataMap[selectedStudentId!] || []) : [];

  return (
    <div className="max-w-6xl mx-auto italic-none">
      {!selectedStudentId ? (
        <div className="animate-fade-in pb-10">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Cohort Overview</h1>
          <p className="text-slate-500 mb-8">Monitoring {students.length} students across behavioral arrays. Ranked by real-time risk severity.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
              <div 
                key={student.student_id} 
                onClick={() => setSelectedStudentId(student.student_id)}
                className={`rounded-2xl border p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${student.risk_level === 'HIGH' ? 'glass-critical border-red-200' : student.risk_level === 'MODERATE' ? 'glass-card border-orange-200' : 'glass-card border-slate-200'}`}
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
      ) : (
        <div className="animate-fade-in pb-20">
          <button 
            onClick={() => setSelectedStudentId(null)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Cohort Overview
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT COLUMN: Overview & Explainable AI */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {selectedStudent?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedStudent?.name}</h2>
                    <p className="text-sm text-slate-500">ID: {selectedStudent?.student_id} • {selectedStudent?.year}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Risk Intelligence</div>
                  <div className={`text-5xl font-black mb-1 ${selectedStudent?.risk_level === 'HIGH' ? 'text-red-500' : selectedStudent?.risk_level === 'MODERATE' ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {selectedStudent?.risk_score.toFixed(0)}
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${selectedStudent?.risk_level === 'HIGH' ? 'bg-red-100 border-red-200 text-red-700' : selectedStudent?.risk_level === 'MODERATE' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                    {selectedStudent?.risk_level} RISK
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Brain className="w-4 h-4 text-indigo-500" /> Explainable AI Analysis
                </h3>
                <ul className="space-y-3">
                  {selectedStudent?.ai_explanation.map((exp, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600">
                      <div className="mt-0.5"><Activity className={`w-4 h-4 ${selectedStudent?.risk_level === 'HIGH' ? 'text-red-400' : 'text-blue-400'}`} /></div>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs font-semibold text-slate-400 flex items-center gap-1.5 justify-end">
                  AI Model Confidence: <span className="text-slate-600">{selectedStudent?.confidence_score.toFixed(1)}%</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Suggested Interventions
                </h3>
                <div className="space-y-3">
                  {selectedStudent?.recommendations.map((rec, i) => (
                    <button key={i} className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium hover:shadow-md ${selectedStudent?.risk_level === 'HIGH' ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100' : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'}`}>
                      <span>{rec}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Analytics */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              <div className="h-96 glass-card rounded-2xl p-6 border border-slate-200 flex flex-col relative">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-blue-500" /> Behavioral Time Series
                  </h3>
                  <div className="flex gap-4 text-xs font-bold px-3 py-1.5 rounded border border-slate-100 bg-slate-50">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedStudent?.risk_level === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></span> STRESS
                    </span>
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedStudent?.risk_level === 'HIGH' ? 'bg-red-400' : 'bg-emerald-500'}`}></span> SENTIMENT
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 w-full relative z-10">
                  <TelemetryChart data={chartData} isCritical={selectedStudent?.risk_level === 'HIGH'} />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Clock className="w-6 h-6 text-slate-400 mb-2" />
                  <div className="text-xl font-bold text-slate-700">{selectedStudent ? formatVal(selectedStudent.screen_time_hours) : '0'}<span className="text-xs text-slate-400 ml-1">hrs</span></div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Screen Time</div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Moon className="w-6 h-6 text-indigo-400 mb-2" />
                  <div className="text-xl font-bold text-slate-700">{selectedStudent ? formatVal(selectedStudent.sleep_hours) : '0'}<span className="text-xs text-slate-400 ml-1">hrs</span></div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">REM Sleep</div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Activity className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="text-xl font-bold text-slate-700">{selectedStudent ? formatVal(selectedStudent.sentiment_score, 2) : '0'}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">NLP Sentiment</div>
                </div>
                <div className="glass-card rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Brain className="w-6 h-6 text-red-400 mb-2" />
                  <div className="text-xl font-bold text-slate-700">{selectedStudent ? formatVal(selectedStudent.stress_level) : '0'}<span className="text-xs text-slate-400 ml-1">idx</span></div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Stress Index</div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-slate-200 flex gap-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Wellness Assistant Logs</h3>
                  <p className="text-sm text-slate-500 mb-4">Last conversational AI assessment for {selectedStudent?.name} completed <span className="font-semibold text-slate-600">3 hours ago</span>.</p>
                  <button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                    Review Interaction History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
