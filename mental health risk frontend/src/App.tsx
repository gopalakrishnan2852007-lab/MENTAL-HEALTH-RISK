import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
import PrivacyPage from "./pages/PrivacyPage";

// Types
import { StudentRiskData } from "./types";

const API = "https://mental-health-risk.onrender.com/"; 

export default function App() {
  const [students, setStudents] = useState<StudentRiskData[]>([]);
  const [chartDataMap, setChartDataMap] = useState<Record<string, any[]>>({});
  const [criticalAlert, setCriticalAlert] = useState<{message: string, count: number} | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = window.location.hostname === "localhost" ? "http://localhost:10000" : API;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('counselor_dashboard_stream', (dataList: StudentRiskData[]) => {
      setStudents(dataList);
      
      setChartDataMap(prev => {
        const nextMap = { ...prev };
        dataList.forEach(st => {
          const timeStr = new Date(st.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const dp = { time: timeStr, stress: st.stress_level, sentiment: st.sentiment_score };
          
          if (!nextMap[st.student_id]) nextMap[st.student_id] = [];
          
          nextMap[st.student_id] = [...nextMap[st.student_id], dp];
          if (nextMap[st.student_id].length > 40) {
            nextMap[st.student_id] = nextMap[st.student_id].slice(-40);
          }
        });
        return nextMap;
      });
      
      if (!dataList.some(s => s.risk_level === 'HIGH')) {
        setCriticalAlert(null);
      }
    });

    socket.on('CRITICAL_RISK_INTERVENTION_REQUIRED', (payload) => {
      setCriticalAlert(prev => ({ 
        message: payload.message, 
        count: (prev?.count || 0) + 1 
      }));
    });

    return () => { socket.disconnect(); };
  }, []);

  const highRiskCount = students.filter(s => s.risk_level === 'HIGH').length;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Student Routes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout isConnected={isConnected}>
                <StudentDashboard students={students} chartDataMap={chartDataMap} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student-checkin" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout isConnected={isConnected}>
                <StudentDashboard students={students} chartDataMap={chartDataMap} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student-wellness" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout isConnected={isConnected}>
                <StudentDashboard students={students} chartDataMap={chartDataMap} />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/student-support" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout isConnected={isConnected}>
                <StudentDashboard students={students} chartDataMap={chartDataMap} />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Protected Counselor Routes */}
          <Route path="/counselor-dashboard" element={
            <ProtectedRoute allowedRoles={['counselor']}>
              <DashboardLayout 
                isConnected={isConnected} 
                highRiskCount={highRiskCount}
                criticalAlert={criticalAlert}
              >
                <CounselorDashboard students={students} chartDataMap={chartDataMap} />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/privacy" element={
            <ProtectedRoute allowedRoles={['student', 'counselor']}>
              <DashboardLayout isConnected={isConnected} highRiskCount={highRiskCount}>
                <PrivacyPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}