import React from 'react';
import { Lock, ShieldCheck, Brain, EyeOff, FileText, ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in italic-none pb-20">
      <div className="glass-card rounded-3xl p-8 border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100 relative z-10">
          <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Privacy & Ethical AI</h1>
            <p className="text-slate-500 font-medium">University Compliance & Student Data Protection</p>
          </div>
        </div>
        
        <div className="space-y-8 relative z-10">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-blue-500" /> Data Sovereignty
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              All telemetry streams (stress, sleep, sentiment) are fully anonymized at the source sensor level. Predictive processing occurs within encrypted enclaves. Identifiable information is only decrypted and visible to certified university counselors when a <span className="font-bold text-red-500 uppercase text-[10px] bg-red-50 px-1.5 py-0.5 rounded border border-red-100 italic-none">High Risk</span> threshold triggers an intervention mandate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" /> Explainable Inference
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              The MindGuard predictive model avoids "black box" decisions. Every calculated risk score provides a transparent, plaintext breakdown of the exact behavioral metrics that contributed to the automated classification. This ensures counselor oversight and prevents algorithmic bias in mental health assessments.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compliance standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { title: 'HIPAA Compliant', desc: 'Secure medical-grade storage', icon: Lock },
                 { title: 'FERPA Protected', desc: 'Academic privacy integration', icon: FileText }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><item.icon className="w-5 h-5 text-slate-400" /></div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white">
         <h2 className="text-xl font-bold mb-4">Questions about your data?</h2>
         <p className="text-slate-400 text-sm mb-6 leading-relaxed">
           Our privacy officer is available to discuss how AI handles your mental health telemetry. No identifiable data is ever sold or used for marketing purposes.
         </p>
         <button className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
           Contact Privacy Officer <ChevronRight className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
