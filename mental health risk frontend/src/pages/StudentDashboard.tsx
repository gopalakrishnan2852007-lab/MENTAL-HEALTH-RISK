import React, { useState } from 'react';
import { 
  Activity, Brain, Moon, Clock, ShieldCheck, HeartPulse, 
  Send, HelpCircle, MessageSquare, LineChart, CheckCircle2,
  Smile, Frown, Meh, AlertCircle, ClipboardCheck
} from "lucide-react";
import TelemetryChart from "../components/TelemetryChart";
import { StudentRiskData } from "../types";
import { useAuth } from "../context/AuthContext";

interface StudentDashboardProps {
  students: StudentRiskData[];
  chartDataMap: Record<string, any[]>;
}

export default function StudentDashboard({ students, chartDataMap }: StudentDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin'>('overview');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  // In a real app, this would filter by user.id
  const student = students.find(s => s.name === user?.name) || students[0];
  const chartData = student ? (chartDataMap[student.student_id] || []) : [];

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinSuccess(true);
    setTimeout(() => setCheckinSuccess(false), 3000);
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto italic-none pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back, {user?.name}</h1>
          <p className="text-slate-500">Your personal wellness enclave is active and secure.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            My Stats
          </button>
          <button 
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'checkin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Daily Check-In
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Main metrics */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-blue-500" /> Behavioral Trends
                </h3>
                <div className="text-xs font-bold text-slate-400">REAL-TIME TELEMETRY</div>
              </div>
              <div className="h-80 w-full">
                <TelemetryChart data={chartData} isCritical={student.risk_level === 'HIGH'} />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
                <Brain className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.stress_level.toFixed(0)}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Stress Lvl</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
                <Moon className="w-8 h-8 text-indigo-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.sleep_hours.toFixed(1)}h</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sleep</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
                <Activity className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.sentiment_score.toFixed(2)}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Mood Score</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
                <Clock className="w-8 h-8 text-orange-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.screen_time_hours.toFixed(1)}h</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Focus Time</div>
              </div>
            </div>
            
            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <div className="relative z-10">
                 <h2 className="text-xl font-bold mb-2">Need to talk to someone?</h2>
                 <p className="text-blue-100 text-sm mb-6 max-w-md">Our counselors are available for confidential sessions. You can request a session anonymously below.</p>
                 <button 
                  onClick={() => setShowSupportModal(true)}
                  className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
                 >
                   <HelpCircle className="w-5 h-5" /> Request Support
                 </button>
               </div>
            </div>
          </div>

          {/* AI Insights & Sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800">AI Wellness Insight</h3>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                 <p className="text-sm text-slate-600 leading-relaxed italic">
                   "Based on your recent sleep patterns and mood check-ins, your resilience remains high, though focus time is increasing. Consider a 15-minute digital break."
                 </p>
              </div>

              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Actions</div>
                 {student.recommendations.slice(0, 3).map((rec, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl text-sm font-medium text-slate-700 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {rec}
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800">
               <h3 className="font-bold mb-4 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" /> Privacy Notice
               </h3>
               <p className="text-xs text-slate-400 leading-relaxed">
                 Your data is end-to-end encrypted. Identifiable metrics are only visible to your counselor. The AI models run in an isolated enclave to ensure your privacy is never compromised.
               </p>
               <button className="mt-4 text-xs font-bold text-blue-400 hover:underline">Read full privacy policy</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
           <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Daily Wellness Check-in</h2>
                  <p className="text-sm text-slate-500">Track your mental state to help AI understand you better.</p>
                </div>
              </div>

              {checkinSuccess ? (
                <div className="text-center py-12 animate-fade-in">
                   <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">Check-in Complete</h3>
                   <p className="text-slate-500">Thank you! Your data helps personalize your wellness plan.</p>
                </div>
              ) : (
                <form onSubmit={handleCheckin} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">How would you describe your mood today?</label>
                    <div className="flex justify-between gap-4">
                      {[
                        { icon: Frown, label: 'Lowed', color: 'text-red-500' },
                        { icon: Meh, label: 'Stable', color: 'text-orange-500' },
                        { icon: Smile, label: 'Energetic', color: 'text-emerald-500' }
                      ].map((m, i) => (
                        <button 
                          key={i}
                          type="button"
                          className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50 transition-all font-bold group"
                        >
                          <m.icon className={`w-8 h-8 ${m.color}`} />
                          <span className="text-xs text-slate-500">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Stress Level (1-10)</label>
                    <input type="range" min="1" max="10" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>CALM</span>
                      <span>MODERATE</span>
                      <span>HIGH</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Journal your thoughts (Optional)</label>
                    <textarea 
                      placeholder="Today I feel..."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-32 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    Submit Entry <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
           </div>
        </div>
      )}

      {/* Support Request Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Request Anonymous Support</h2>
              <p className="text-slate-500 text-sm mb-6">Your identity will be masked until you choose to reveal it. A university counselor will reach out via the secure portal chat.</p>
              
              <div className="space-y-4 mb-8">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reason for request</label>
                    <select className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none">
                       <option>Academic Pressure</option>
                       <option>Social Anxiety</option>
                       <option>Grief or Loss</option>
                       <option>General Support</option>
                    </select>
                 </div>
              </div>

              <button 
                onClick={() => setShowSupportModal(false)}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Confirm Secure Request
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
