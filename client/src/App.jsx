import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AIAssistantModal from './components/layout/AIAssistantModal';

// Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import TimetablePage from './pages/Timetable/TimetablePage';
import AttendancePage from './pages/Attendance/AttendancePage';
import AssignmentsPage from './pages/Assignments/AssignmentsPage';
import ExamsPage from './pages/Exams/ExamsPage';
import StudyPlannerPage from './pages/StudyPlanner/StudyPlannerPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import SearchModal from './pages/Search/SearchModal';
import SettingsPage from './pages/Settings/SettingsPage';
import AdminPage from './pages/Admin/AdminPage';

// Protected Route Wrapper
const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onOpenAIChat={() => setAiChatOpen(true)} 
        />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/dashboard" element={<Dashboard onOpenAIChat={() => setAiChatOpen(true)} />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/search" element={<SearchModal />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/users" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating AI Assistant Chat Window */}
      <AIAssistantModal isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Portal Routes */}
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
