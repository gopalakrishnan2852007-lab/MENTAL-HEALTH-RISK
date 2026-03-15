import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AlertTriangle } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  isConnected: boolean;
  highRiskCount?: number;
  criticalAlert?: { message: string, count: number } | null;
}

export default function DashboardLayout({ 
  children, 
  isConnected, 
  highRiskCount = 0,
  criticalAlert = null
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden italic-none">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        <Header isConnected={isConnected} highRiskCount={highRiskCount} />

        {/* Dynamic Critical Alert Banner */}
        {criticalAlert && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2.5 text-center text-xs font-bold uppercase shadow-md z-40 flex items-center justify-center gap-3 animate-slide-up">
            <AlertTriangle className="w-4 h-4" />
            {criticalAlert.message} • INTERVENTION PROTOCOLS ACTIVE
          </div>
        )}

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
