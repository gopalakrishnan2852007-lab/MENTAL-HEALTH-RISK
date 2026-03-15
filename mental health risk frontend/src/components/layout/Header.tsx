import React from 'react';
import { Wifi, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  isConnected: boolean;
  highRiskCount?: number;
}

export default function Header({ isConnected, highRiskCount = 0 }: HeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {user?.role === 'counselor' ? (
          highRiskCount > 0 ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full text-red-600 font-bold text-xs uppercase animate-pulse shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              {highRiskCount} PRIORITY {highRiskCount === 1 ? 'ALERT' : 'ALERTS'}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-emerald-600 font-bold text-xs uppercase shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              ALL COHORTS STABLE
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-blue-600 font-bold text-xs uppercase shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            STUENT PORTAL SECURE
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="tracking-wider">AI ENCLAVE STATUS</span>
          <Wifi className={`w-4 h-4 ${isConnected ? 'text-blue-500' : 'text-slate-300'}`} />
        </div>
      </div>
    </header>
  );
}
