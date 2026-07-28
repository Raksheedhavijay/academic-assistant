import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Upload, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Plus, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import CircularProgress from '../../components/ui/CircularProgress';

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [analytics, setAnalytics] = useState({ percentage: 86.4, daysPresent: 14, daysAbsent: 2, shortageWarning: false });
  const [loading, setLoading] = useState(true);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Staff mark attendance form state
  const [formData, setFormData] = useState({
    studentName: 'Radha Raman',
    rollNumber: '21CSE045',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    subject: 'Artificial Intelligence & Machine Learning',
    subjectCode: 'CS601',
    date: new Date().toISOString().split('T')[0],
    hour: 1,
    timing: '09:30 - 11:00',
    attendanceStatus: 'Present',
    reasonForAbsence: '',
    remarks: ''
  });

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/attendance');
      if (data.success) {
        setAttendanceList(data.data);
        if (data.analytics) setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/attendance', formData);
      if (data.success) {
        setShowMarkModal(false);
        fetchAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking attendance.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const body = new FormData();
    body.append('medicalCertificate', file);

    setUploading(true);
    try {
      const { data } = await API.post('/attendance/upload-medical', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        alert('✅ Medical certificate uploaded successfully! Staff will review for absence exemption.');
      }
    } catch (err) {
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  // Recharts trend data
  const chartData = [
    { week: 'W1', attendance: 90 },
    { week: 'W2', attendance: 85 },
    { week: 'W3', attendance: 80 },
    { week: 'W4', attendance: 88 },
    { week: 'W5', attendance: 86.4 }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white gradient-text">
            Attendance Analytics & Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time percentage calculations, shortage warnings (&lt;75%), and medical leave submission.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isStaffOrAdmin ? (
            <>
              <button
                onClick={() => setShowMarkModal(true)}
                className="px-4 py-2.5 rounded-xl gradient-btn flex items-center space-x-2 text-xs font-semibold shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Mark Student Attendance</span>
              </button>

              <label className="px-3.5 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-primary" />
                <span>{uploading ? 'Uploading...' : 'Staff Upload Medical Cert'}</span>
                <input type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
              </label>
            </>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              Student Attendance View (Sunday: Common Holiday)
            </span>
          )}
        </div>
      </div>

      {/* Shortage Alert */}
      {analytics.shortageWarning && (
        <div className="p-4 rounded-2xl bg-danger/20 border border-danger/40 text-danger flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">CRITICAL ATTENDANCE WARNING</h4>
              <p className="text-xs">
                Your total attendance is {analytics.percentage}%, which is below 75%. You need to attend <strong>{analytics.classesNeededToReach75}</strong> consecutive classes without fail.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meter Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Overall Semester Percentage</h3>
          <CircularProgress value={analytics.percentage} size={150} strokeWidth={14} />
          <p className="text-xs text-slate-400 mt-4">
            Target 85%: Need <strong>{analytics.target85Needed || 4}</strong> more lectures
          </p>
        </div>

        {/* Attendance Graph */}
        <div className="md:col-span-2 glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>5-Week Attendance Trend</span>
            </h3>
            <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              Stable Performance
            </span>
          </div>

          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Detailed Attendance Records</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-400">
                <th className="pb-3">Date</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Timing</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Remarks / Medical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {attendanceList.map((rec) => (
                <tr key={rec._id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono font-medium">{rec.date}</td>
                  <td className="py-3">
                    <span className="font-bold block text-slate-900 dark:text-white">{rec.subject}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.subjectCode}</span>
                  </td>
                  <td className="py-3 font-mono text-slate-400">{rec.timing}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                      rec.attendanceStatus === 'Present'
                        ? 'bg-success/20 text-success border border-success/30'
                        : rec.attendanceStatus === 'Late'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : 'bg-danger/20 text-danger border border-danger/30'
                    }`}>
                      {rec.attendanceStatus}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {rec.reasonForAbsence || rec.remarks || 'Regular class session'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Mark Attendance Modal */}
      <AnimatePresence>
        {showMarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg gradient-text">Mark Attendance Record</h3>
                <button onClick={() => setShowMarkModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMarkSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Student Name</label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Attendance Status</label>
                    <select
                      value={formData.attendanceStatus}
                      onChange={(e) => setFormData({ ...formData, attendanceStatus: e.target.value })}
                      className="w-full glass-input text-xs"
                    >
                      <option value="Present" className="bg-slate-900">Present</option>
                      <option value="Absent" className="bg-slate-900">Absent</option>
                      <option value="Late" className="bg-slate-900">Late</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl gradient-btn text-xs font-semibold mt-2">
                  Save Attendance Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
