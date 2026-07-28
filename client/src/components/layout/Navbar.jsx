import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  BotMessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar({ onToggleSidebar, onOpenAIChat }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Mobile menu & search toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 lg:hidden focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Trigger Button */}
          <div 
            onClick={() => navigate('/search')}
            className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer backdrop-blur-md transition-all w-64 md:w-80 shadow-inner"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Search students, staff, assignments...</span>
            <kbd className="hidden md:inline-block ml-auto text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* AI Floating Trigger Quick Action */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BotMessageSquare className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors relative shadow-sm"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto my-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3 rounded-xl transition-colors my-1 ${notif.read ? 'opacity-70' : 'bg-primary/5 dark:bg-primary/10 border-l-2 border-primary'}`}
                      >
                        <div className="flex items-start space-x-2">
                          {notif.type === 'Attendance' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div 
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
