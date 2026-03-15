import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, User, Users, Lock, LogOut, 
  LayoutDashboard, ClipboardCheck, Activity, HelpCircle, AlertCircle, BarChart2
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student-dashboard' },
    { name: 'Daily Check-In', icon: ClipboardCheck, path: '/student-checkin' },
    { name: 'My Wellness', icon: Activity, path: '/student-wellness' },
    { name: 'Support Request', icon: HelpCircle, path: '/student-support' },
  ];

  const counselorItems = [
    { name: 'Cohort Overview', icon: Users, path: '/counselor-dashboard' },
    { name: 'Risk Alerts', icon: AlertCircle, path: '/counselor-alerts' },
    { name: 'Student Analytics', icon: BarChart2, path: '/counselor-analytics' },
    { name: 'Privacy & Ethics', icon: Lock, path: '/privacy' },
  ];

  const items = user?.role === 'student' ? studentItems : counselorItems;

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-30 relative">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none"></div>
      
      <div>
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 relative z-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm text-white bg-blue-600 shadow-blue-600/30">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight text-slate-800">
            Mind<span className="text-blue-600">Guard</span>
          </span>
        </div>

        <nav className="p-3 space-y-1 mt-4 relative z-10">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all font-medium text-sm
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 relative z-10 space-y-4">
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-800 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 capitalize truncate">{user?.role}</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all font-medium text-sm text-red-600 hover:bg-red-50 border border-transparent"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
