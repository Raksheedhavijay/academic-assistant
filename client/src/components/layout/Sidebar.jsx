import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  BrainCircuit,
  BarChart3,
  Search,
  Settings,
  Users,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'student';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'student'] },
    { name: 'Timetable', path: '/timetable', icon: CalendarDays, roles: ['admin', 'staff', 'student'] },
    { name: 'Attendance', path: '/attendance', icon: CheckSquare, roles: ['admin', 'staff', 'student'] },
    { name: 'Assignments', path: '/assignments', icon: FileText, roles: ['admin', 'staff', 'student'] },
    { name: 'Exams & Hall Ticket', path: '/exams', icon: GraduationCap, roles: ['admin', 'staff', 'student'] },
    { name: 'Study Planner', path: '/study-planner', icon: BrainCircuit, roles: ['student', 'admin'] },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'staff', 'student'] },
    { name: 'Global Search', path: '/search', icon: Search, roles: ['admin', 'staff', 'student'] },
    { name: 'User Management', path: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'staff', 'student'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    staff: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }[role];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/10 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex flex-col h-full p-4">
        {/* Brand Logo Header */}
        <div className="flex items-center space-x-3 px-2 py-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight gradient-text tracking-wide">Academic AI</h1>
            <p className="text-xs text-slate-400 font-medium">Agent Portal v2.0</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-3 mb-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user?.name || 'User Name'}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor} uppercase tracking-wider`}>
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary-700 text-white shadow-lg shadow-primary/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-primary dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Action Button */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
