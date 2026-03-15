import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Radio } from 'lucide-react';

export default function NewsTicker({ alerts }: { alerts: any[] }) {
  if (!alerts || alerts.length === 0 || (alerts.length > 0 && alerts[0].severity === 'INFO')) {
    return (
      <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center overflow-hidden shrink-0">
        <div className="px-4 bg-emerald-600 h-full flex items-center z-10 font-bold text-[10px] uppercase tracking-widest shrink-0 text-white shadow-sm gap-2">
          <Radio className="w-3 h-3 animate-pulse" />
          SYSTEM STATUS
        </div>
        <div className="flex-1 flex items-center px-4">
          <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">All campus well-being metrics stable. No immediate counselor interventions required.</span>
        </div>
      </div>
    );
  }

  // Duplicate alerts to make the marquee continuous
  const tickerItems = [...alerts, ...alerts, ...alerts];

  return (
    <div className="h-8 bg-purple-50 border-b border-purple-100 flex items-center overflow-hidden shrink-0 relative">
      <div className="px-4 bg-purple-600 h-full flex items-center z-10 font-bold text-[10px] uppercase tracking-widest shrink-0 text-white shadow-sm gap-2">
        <Radio className="w-3 h-3 animate-pulse text-white" />
        ACTIVE ALERTS
      </div>

      {/* Gradient mask for smooth fade in/out */}
      <div className="absolute left-32 top-0 bottom-0 w-16 bg-gradient-to-r from-purple-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

      <div className="flex-1 overflow-hidden relative h-full flex items-center ml-4">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: Math.max(20, alerts.length * 5) }}
          className="whitespace-nowrap flex items-center gap-12"
        >
          {tickerItems.map((a, i) => (
            <span key={i} className={`text-[11px] font-bold flex items-center gap-2 tracking-wide ${a.severity === 'CRITICAL' ? 'text-purple-700' : 'text-amber-600'}`}>
              <AlertCircle className={`w-3.5 h-3.5 ${a.severity === 'CRITICAL' ? 'text-purple-600 animate-pulse' : 'text-amber-500'}`} />
              <span className={a.severity === 'CRITICAL' ? 'text-purple-800 uppercase' : 'text-amber-700 uppercase'}>{a.severity}:</span>
              {a.message}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
