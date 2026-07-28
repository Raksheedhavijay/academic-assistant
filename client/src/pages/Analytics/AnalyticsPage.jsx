import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  CheckSquare, 
  GraduationCap, 
  Clock, 
  Download 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import API from '../../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white gradient-text">
            Academic Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual reports for attendance, assignment submission rates, study hours, and exam performance.
          </p>
        </div>

        <button
          onClick={() => alert('Generating full semester report PDF...')}
          className="px-4 py-2.5 rounded-xl gradient-btn flex items-center space-x-2 text-xs font-semibold shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Semester Report</span>
        </button>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours Trend */}
        <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Weekly Study Hours Logged</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.studyHoursTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Bar dataKey="hours" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span>Exam Scores vs Class Average</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.charts?.examPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} />
                <Line type="monotone" dataKey="average" stroke="#14B8A6" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
