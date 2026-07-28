import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  CheckSquare, 
  FileText, 
  GraduationCap, 
  Clock, 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import CircularProgress from '../../components/ui/CircularProgress';
import Skeleton from '../../components/ui/Skeleton';

export default function Dashboard({ onOpenAIChat }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 100, daysPresent: 0, daysAbsent: 0, shortageWarning: false });
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [nextExam, setNextExam] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isSunday = currentDayName === 'Sunday';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ttRes, attRes, asgRes, examRes] = await Promise.all([
          API.get('/timetable'),
          API.get('/attendance'),
          API.get('/assignments'),
          API.get('/exams')
        ]);

        if (ttRes.data.success) setTimetable(ttRes.data.data);
        if (attRes.data.success && attRes.data.analytics) setAttendanceStats(attRes.data.analytics);
        if (asgRes.data.success) setAssignments(asgRes.data.data);
        if (examRes.data.success && examRes.data.data.length > 0) {
          setExams(examRes.data.data);
          setNextExam(examRes.data.data[0]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dynamic live countdown calculation for upcoming exam
  useEffect(() => {
    const updateTimer = () => {
      if (!nextExam || !nextExam.examDate) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const targetDate = new Date(`${nextExam.examDate}T09:00:00`);
      const diff = targetDate.getTime() - Date.now();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setCountdown({ days, hours, mins, secs });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [nextExam]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const role = user?.role || 'student';
  const todaySlots = timetable.filter(t => t.day === currentDayName);
  const displaySlots = todaySlots.length > 0 ? todaySlots : timetable;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-xl bg-gradient-to-r from-primary/10 via-accent/10 to-transparent relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                {role} Dashboard
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {user?.semester ? `Semester ${user.semester}` : ''} • {user?.department || 'Computer Science'} {user?.section ? `(Sec ${user.section})` : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span>! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here is your student-specific academic intelligence overview and schedule.
            </p>
          </div>

          <button
            onClick={onOpenAIChat}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl gradient-btn shadow-lg shadow-primary/25 font-semibold text-xs sm:text-sm"
          >
            <Bot className="w-5 h-5 animate-pulse" />
            <span>Launch AI Assistant</span>
          </button>
        </div>
      </motion.div>

      {/* Sunday Common Holiday Banner */}
      {isSunday && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarDays className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Sunday - Common Holiday</h4>
              <p className="text-xs opacity-90">
                Today is Sunday. No scheduled lectures or regular attendance tracking for students, staff, and admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Shortage Warning Banner (If < 75%) */}
      {attendanceStats.shortageWarning && (
        <div className="p-4 rounded-2xl bg-danger/20 border border-danger/40 text-danger flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Attendance Shortage Alert ({attendanceStats.percentage}%)</h4>
              <p className="text-xs opacity-90">
                You are below the 75% requirement! You must attend the next <strong>{attendanceStats.classesNeededToReach75}</strong> consecutive classes without fail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance Rate" value={`${attendanceStats.percentage}%`} change={`${attendanceStats.daysPresent} present, ${attendanceStats.daysAbsent} absent`} icon={CheckSquare} color={attendanceStats.percentage < 75 ? 'danger' : 'success'} />
        <StatCard title="Today's Classes" value={todaySlots.length} change={`${currentDayName} Schedule`} icon={CalendarDays} color="primary" />
        <StatCard title="Active Assignments" value={assignments.length} change={`${assignments.filter(a => a.priority === 'High').length} High Priority`} icon={FileText} color="accent" />
        <StatCard title="Upcoming Exam" value={nextExam ? nextExam.subjectCode : 'CS601'} change={`${countdown.days} Days ${countdown.hours} Hours`} icon={GraduationCap} color="secondary" />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Today's Class Schedule</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                {currentDayName} {isSunday ? '(Holiday)' : 'Schedule'}
              </span>
            </div>

            <div className="space-y-3">
              {displaySlots.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No scheduled classes for today.</p>
              ) : (
                displaySlots.slice(0, 4).map((slot, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/50 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-10 rounded-full ${slot.lectureType === 'Lab' ? 'bg-accent' : slot.lectureType === 'Practical' ? 'bg-purple-500' : 'bg-primary'}`} />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{slot.subjectName}</h4>
                        <p className="text-xs text-slate-400">
                          {slot.staffName} • <span className="text-primary font-medium">{slot.classroom}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1 font-semibold uppercase">{slot.lectureType}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Assignments Widget */}
          <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Assignments</h3>
              </div>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div key={asg._id} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 uppercase">{asg.priority} Priority</span>
                      <span className="text-xs text-slate-400">{asg.subjectCode}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">{asg.assignmentTitle}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{asg.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-danger">Due: {new Date(asg.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          {/* Attendance Meter Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg text-center flex flex-col items-center">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Attendance Meter</h3>
            <CircularProgress value={attendanceStats.percentage} size={140} strokeWidth={12} />
            <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div>
                <span className="text-xs text-slate-400 block">Days Present</span>
                <span className="text-lg font-bold text-success">{attendanceStats.daysPresent}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Days Absent</span>
                <span className="text-lg font-bold text-danger">{attendanceStats.daysAbsent}</span>
              </div>
            </div>
          </div>

          {/* Exam Live Countdown Widget */}
          <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg bg-gradient-to-br from-secondary/10 via-transparent to-primary/10">
            <div className="flex items-center space-x-2 mb-3">
              <GraduationCap className="w-5 h-5 text-secondary" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Next Exam Countdown</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{nextExam ? `${nextExam.examName} (${nextExam.subject})` : 'Mid-Semester Theory 2026'}</p>

            <div className="grid grid-cols-4 gap-2 my-4 text-center">
              <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="block text-xl font-bold font-mono text-primary">{countdown.days}</span>
                <span className="text-[9px] uppercase font-semibold text-slate-400">Days</span>
              </div>
              <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="block text-xl font-bold font-mono text-primary">{countdown.hours}</span>
                <span className="text-[9px] uppercase font-semibold text-slate-400">Hrs</span>
              </div>
              <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="block text-xl font-bold font-mono text-primary">{countdown.mins}</span>
                <span className="text-[9px] uppercase font-semibold text-slate-400">Mins</span>
              </div>
              <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="block text-xl font-bold font-mono text-primary">{countdown.secs}</span>
                <span className="text-[9px] uppercase font-semibold text-slate-400">Secs</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Recommendations</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-accent font-bold">•</span>
                <span>Review core module notes before your upcoming {todaySlots[0]?.subjectName || 'lectures'}.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent font-bold">•</span>
                <span>Complete focus study session on pending coursework.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
