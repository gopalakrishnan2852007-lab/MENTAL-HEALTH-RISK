import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, Moon, Clock, ShieldCheck, HeartPulse, 
  Send, HelpCircle, MessageSquare, LineChart, CheckCircle2,
  Smile, Frown, Meh, AlertCircle, ClipboardCheck, ArrowUpRight
} from "lucide-react";
import TelemetryChart from "../components/TelemetryChart";
import { StudentRiskData } from "../types";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface StudentDashboardProps {
  students: StudentRiskData[];
  chartDataMap: Record<string, any[]>;
}

export default function StudentDashboard({ students, chartDataMap }: StudentDashboardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin' | 'wellness' | 'support'>('overview');
  
  // Form States
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [stressVal, setStressVal] = useState(5);
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportReason, setSupportReason] = useState("General Support");
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('checkin')) setActiveTab('checkin');
    else if (path.includes('wellness')) setActiveTab('wellness');
    else if (path.includes('support')) setActiveTab('support');
    else setActiveTab('overview');
  }, [location.pathname]);

  // Robust student data picking for demo
  // In a real app we'd fetch the specific student by user.id
  const student = students.find(s => s.name === user?.name) || students[0];
  const chartData = student ? (chartDataMap[student.student_id] || []) : [];

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSubmitting(true);
    try {
      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:10000' : '';
      const response = await fetch(`${baseUrl}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.student_id,
          stress_level: stressVal,
          mood: selectedMood,
          journal: journalText
        })
      });

      if (response.ok) {
        setCheckinSuccess(true);
        setTimeout(() => setCheckinSuccess(false), 3000);
        // Reset form
        setSelectedMood(null);
        setStressVal(5);
        setJournalText("");
      }
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportRequest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSupportSuccess(true);
      setTimeout(() => {
        setSupportSuccess(false);
        setShowSupportModal(false);
      }, 2500);
    }, 1500);
  };

  if (!student) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto italic-none pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back, {user?.name}</h1>
          <p className="text-slate-500 font-medium">Your personal wellness enclave is active and secure.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => { navigate('/student-dashboard'); }}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => { navigate('/student-checkin'); }}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === 'checkin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Journal
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-blue-500" /> My Wellness Trends
                </h3>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-400">LIVE FEED</span>
                </div>
              </div>
              <div className="h-80 w-full">
                <TelemetryChart data={chartData} isCritical={student.risk_level === 'HIGH'} />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center">
                <Brain className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.stress_level.toFixed(0)}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Stress Index</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center">
                <Moon className="w-8 h-8 text-indigo-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.sleep_hours.toFixed(1)}h</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sleep Goal</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center">
                <Activity className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.sentiment_score.toFixed(2)}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Mood Score</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center">
                <Clock className="w-8 h-8 text-orange-500 mb-2" />
                <div className="text-2xl font-black text-slate-800">{student.screen_time_hours.toFixed(1)}h</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Screen Time</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-bold mb-3">Feeling overwhelmed?</h2>
                 <p className="text-blue-100 text-sm mb-6 max-w-md leading-relaxed">Our clinical outreach team is available for 100% confidential support sessions. No data is shared with faculty.</p>
                 <button 
                  onClick={() => setShowSupportModal(true)}
                  className="bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
                 >
                   <HelpCircle className="w-5 h-5" /> Request Support
                 </button>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800">AI Personal Insight</h3>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                 <p className="text-sm text-slate-600 leading-relaxed italic">
                   "{student.risk_level === 'HIGH' ? 'Your stress patterns indicate a need for immediate decompression. Please review the suggested actions.' : 'Your resilience metrics are trending positively. Maintenance of current rest patterns is highly recommended.'}"
                 </p>
              </div>

              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Actions</div>
                 {student.recommendations.map((rec, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl text-xs font-medium text-slate-700 shadow-sm translate-all hover:border-blue-200 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {rec}
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800">
               <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400">
                 <ShieldCheck className="w-5 h-5" /> Privacy Verified
               </h3>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 Your AI metrics are processed in a secure enclave. Your name is anonymized in all aggregate university reports.
               </p>
               <button className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">Explore Privacy Docs</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checkin' && (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
           <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Daily Wellness Check-in</h2>
                  <p className="text-sm text-slate-500 font-medium">Help the AI understand your state better.</p>
                </div>
              </div>

              {checkinSuccess ? (
                <div className="text-center py-12 animate-fade-in">
                   <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-2">Check-in Logged</h3>
                   <p className="text-slate-500 font-medium">Your personal insight will be updated in moments.</p>
                </div>
              ) : (
                <form onSubmit={handleCheckin} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">How would you describe your mood today?</label>
                    <div className="flex justify-between gap-4">
                      {[
                        { id: 'low', icon: Frown, label: 'Low', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                        { id: 'mid', icon: Meh, label: 'Stable', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                        { id: 'high', icon: Smile, label: 'Great', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' }
                      ].map((m) => (
                        <button 
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMood(m.id)}
                          className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all font-bold group ${selectedMood === m.id ? `border-blue-600 ${m.bg}` : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                          <m.icon className={`w-10 h-10 ${selectedMood === m.id ? m.color : 'text-slate-300 group-hover:text-slate-400'}`} />
                          <span className={`text-xs ${selectedMood === m.id ? 'text-slate-800' : 'text-slate-400'}`}>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-slate-700">Self-Reported Stress (1-10)</label>
                      <span className="text-lg font-black text-blue-600">{stressVal}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={stressVal}
                      onChange={(e) => setStressVal(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>CALM</span>
                      <span>NORMAL</span>
                      <span>HIGH</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Thoughts or Events (Optional)</label>
                    <textarea 
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Start writing..."
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-40 resize-none transition-all"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || !selectedMood}
                    className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Log Entry <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
           </div>
        </div>
      )}

      {activeTab === 'wellness' && (
        <div className="animate-fade-in space-y-8">
           <h2 className="text-3xl font-black text-slate-800">My Wellness Resources</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-8 border border-slate-200">
                 <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <Activity className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Behavioral Insights</h3>
                 <p className="text-slate-500 mb-6 font-medium">Deep dive into your sleep and digital stress metrics over the last 30 days.</p>
                 <button className="text-sm font-bold text-indigo-600 flex items-center gap-2 group">
                    View Full Analysis <ArrowUpRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                 </button>
              </div>
              <div className="glass-card rounded-3xl p-8 border border-slate-200">
                 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                    <HeartPulse className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Meditation & Exercises</h3>
                 <p className="text-slate-500 mb-6 font-medium">Personalized mindfulness routines based on your current AI stress index.</p>
                 <button className="text-sm font-bold text-emerald-600 flex items-center gap-2 group">
                    Start Session <ArrowUpRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="animate-fade-in space-y-8 max-w-3xl">
           <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-lg shadow-red-100">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800">Support Center</h2>
                  <p className="text-slate-500 font-medium">Confidential access to university mental health professionals.</p>
                </div>
           </div>

           <div className="grid gap-4">
              <button 
                onClick={() => setShowSupportModal(true)}
                className="w-full text-left glass-card rounded-3xl p-8 border border-slate-200 flex items-center justify-between hover:border-red-200 transition-all group"
              >
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-50 rounded-2xl text-red-600"><AlertCircle className="w-6 h-6" /></div>
                    <div>
                       <div className="text-lg font-bold text-slate-800">Crisis Intervention</div>
                       <div className="text-sm text-slate-500 font-medium italic-none">Immediate anonymous outreach to on-duty counselors.</div>
                    </div>
                 </div>
                 <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </button>

              <div className="glass-card rounded-3xl p-8 border border-slate-200 flex items-center justify-between opacity-60">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-100 rounded-2xl text-slate-400"><MessageSquare className="w-6 h-6" /></div>
                    <div>
                       <div className="text-lg font-bold text-slate-400">Scheduled Sessions</div>
                       <div className="text-sm text-slate-400 font-medium italic-none">Plan a 1-on-1 meeting (Next available: Tomorrow 10AM).</div>
                    </div>
                 </div>
                 <Lock className="w-5 h-5 text-slate-300" />
              </div>
           </div>
        </div>
      )}

      {/* Support Request Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[2rem] p-8 lg:p-10 max-w-md w-full shadow-2xl animate-fade-in-up border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors p-2">&times;</button>
              </div>

              {supportSuccess ? (
                <div className="text-center py-10 animate-fade-in">
                   <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2">Request Sent</h3>
                   <p className="text-slate-500 font-medium">A counselor will reach out to you anonymously in the next 30 minutes.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Anonymous Support</h2>
                  </div>

                  <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed italic-none">
                    Your identity is masked using end-to-end university encryption. Counselors see only your metrics, not your name, until you provide consent.
                  </p>
                  
                  <div className="space-y-6 mb-10">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Concern</label>
                        <select 
                          value={supportReason}
                          onChange={(e) => setSupportReason(e.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                        >
                          <option>Academic Stress</option>
                          <option>Personal Anxiety</option>
                          <option>Support Outreach</option>
                          <option>Other</option>
                        </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleSupportRequest}
                    disabled={isSubmitting}
                    className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>Send Confidential Request <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
}

// Helper icons for convenience
const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const Lock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
