import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Sparkles, 
  AlertTriangle,
  Clock,
  UserCheck,
  Building,
  BookOpen,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function TimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [viewMode, setViewMode] = useState('weekly'); // 'daily' | 'weekly' | 'monthly' | 'calendar'
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [conflictError, setConflictError] = useState('');

  // Staff creation form state
  const [formData, setFormData] = useState({
    courseName: 'B.Tech Computer Science',
    courseCode: 'BTECH-CSE',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    subjectName: 'Artificial Intelligence & Machine Learning',
    subjectCode: 'CS601',
    staffName: user?.name || 'Prof. Alan Turing',
    staffId: user?.staffId || 'STF101',
    classroom: 'Lab 3 (AI Lab)',
    day: 'Monday',
    startTime: '09:30',
    endTime: '11:00',
    studentsRollNumbers: '21CSE045, 21CSE046, 21CSE047',
    studentsNames: 'Radha Raman, Beatriz Silva, Alex Johnson',
    topicToBeCovered: 'Deep Neural Networks & Backpropagation',
    lectureType: 'Theory'
  });

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/timetable?search=${search}`);
      if (data.success) {
        setTimetable(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [search]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setConflictError('');

    try {
      const payload = {
        ...formData,
        studentsRollNumbers: formData.studentsRollNumbers.split(',').map(s => s.trim()),
        studentsNames: formData.studentsNames.split(',').map(s => s.trim())
      };

      const { data } = await API.post('/timetable', payload);
      if (data.success) {
        setShowCreateModal(false);
        fetchTimetable();
      }
    } catch (err) {
      if (err.response?.data?.isConflict) {
        setConflictError(err.response.data.message);
      } else {
        setConflictError(err.response?.data?.message || 'Error creating timetable entry.');
      }
    }
  };

  const handleAISuggest = async () => {
    try {
      const { data } = await API.post('/timetable/ai-suggest', {
        day: formData.day,
        classroom: formData.classroom,
        startTime: formData.startTime,
        semester: formData.semester,
        section: formData.section
      });
      if (data.success) {
        alert(`🤖 AI Schedule Recommendation:\n${data.recommendation.message || data.recommendation.conflictReason}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = "Day,Subject,Code,Classroom,Staff,Time,Type\n";
    const rows = timetable.map(t => `"${t.day}","${t.subjectName}","${t.subjectCode}","${t.classroom}","${t.staffName}","${t.startTime}-${t.endTime}","${t.lectureType}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Timetable_Schedule.csv';
    a.click();
  };

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white gradient-text">
            Timetable Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedule lectures, resolve conflicts, and view daily/weekly class timetables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isStaffOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl gradient-btn flex items-center space-x-2 text-xs font-semibold shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Timetable Slot</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* View Selector Tabs & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-white/20 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* View Mode Buttons */}
        <div className="flex items-center space-x-1 bg-white/40 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          {['daily', 'weekly', 'monthly', 'calendar'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === mode
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode} View
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter subject, staff, room..."
            className="w-full glass-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Day Filter Tabs for Daily View */}
      {viewMode === 'daily' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {daysList.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                  : 'bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {day}
            </button>
          ))}
          <div className="px-4 py-2 rounded-xl text-xs font-semibold shrink-0 bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Sunday (Common Holiday)
          </div>
        </div>
      )}

      {/* Weekly View Layout */}
      {viewMode === 'weekly' && (
        <div className="space-y-6">
          {daysList.map((dayName) => {
            const daySlots = timetable.filter(t => t.day === dayName);
            return (
              <div key={dayName} className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>{dayName}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">{daySlots.length} Subject Lectures</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No scheduled lectures for {dayName}.</p>
                  ) : (
                    daySlots.map((slot) => (
                      <div key={slot._id} className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-primary">{slot.subjectCode}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary/20 text-secondary">{slot.lectureType}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mt-1">{slot.subjectName}</h4>
                        <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3 text-accent" />
                            <span>{slot.classroom} • {slot.staffName}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          <div className="glass-card p-5 rounded-3xl border border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5" />
              <span className="font-bold">Sunday - Common Weekly Holiday</span>
            </div>
            <span>No lectures scheduled</span>
          </div>
        </div>
      )}

      {/* Monthly & Calendar View Layout */}
      {(viewMode === 'monthly' || viewMode === 'calendar') && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Academic Calendar & Monthly Subject Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">Month: August 2026</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase pb-2">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div className="text-amber-500">Sun (Holiday)</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(2026, 7, dayNum);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
              const isSun = dateObj.getDay() === 0;
              const daySlots = timetable.filter(t => t.day === dayName);

              return (
                <div
                  key={dayNum}
                  className={`p-2.5 min-h-[90px] rounded-2xl border text-left flex flex-col justify-between text-xs ${
                    isSun
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono">{dayNum}</span>
                    {isSun && <span className="text-[9px] uppercase font-bold text-amber-500">Holiday</span>}
                  </div>

                  {isSun ? (
                    <span className="text-[10px] text-amber-400 italic">Sunday Off</span>
                  ) : (
                    <div className="space-y-1">
                      {daySlots.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="p-1 rounded bg-primary/20 text-primary text-[9px] font-bold truncate">
                          {s.startTime} {s.subjectCode}
                        </div>
                      ))}
                      {daySlots.length > 2 && (
                        <span className="text-[9px] text-slate-400 block">+{daySlots.length - 2} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timetable Daily Grid View */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timetable
            .filter(t => t.day === selectedDay)
            .map((slot) => (
              <motion.div
                key={slot._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg relative group hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                      {slot.lectureType}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">{slot.subjectName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{slot.subjectCode}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {slot.day}
                  </span>
                </div>

                <div className="my-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200/50 dark:border-slate-700/50 py-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-mono font-semibold">{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-accent" />
                    <span>Classroom: <strong>{slot.classroom}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-secondary" />
                    <span>Faculty: <strong>{slot.staffName}</strong></span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">Topic: {slot.topicToBeCovered || 'Core syllabus'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* Staff Create Timetable Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg gradient-text">Create Timetable Slot</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {conflictError && (
                <div className="mt-4 p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger text-xs font-medium flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{conflictError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSlot} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject Code</label>
                    <input
                      type="text"
                      required
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Day</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="w-full glass-input text-xs"
                    >
                      {daysList.map(d => <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Classroom / Lab</label>
                    <input
                      type="text"
                      required
                      value={formData.classroom}
                      onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Lecture Type</label>
                    <select
                      value={formData.lectureType}
                      onChange={(e) => setFormData({ ...formData, lectureType: e.target.value })}
                      className="w-full glass-input text-xs"
                    >
                      <option value="Theory" className="bg-slate-900">Theory</option>
                      <option value="Lab" className="bg-slate-900">Lab</option>
                      <option value="Seminar" className="bg-slate-900">Seminar</option>
                      <option value="Practical" className="bg-slate-900">Practical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Topic to be Covered</label>
                  <input
                    type="text"
                    value={formData.topicToBeCovered}
                    onChange={(e) => setFormData({ ...formData, topicToBeCovered: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleAISuggest}
                    className="px-3.5 py-2 rounded-xl bg-accent/20 text-accent border border-accent/30 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Check Optimal Slot</span>
                  </button>

                  <button type="submit" className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-semibold">
                    Save Timetable Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
