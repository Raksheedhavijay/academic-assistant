import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Download, 
  Clock, 
  Plus, 
  BookOpen, 
  Sparkles, 
  Building, 
  QrCode,
  FileCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiPrepModal, setAiPrepModal] = useState(null);

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  // Staff Exam creation form
  const [formData, setFormData] = useState({
    examName: 'End-Semester University Theory Examination 2026',
    category: 'University',
    subject: 'Artificial Intelligence & Machine Learning',
    subjectCode: 'CS601',
    examDate: '2026-08-15',
    examTime: '10:00 AM - 01:00 PM',
    duration: '3 Hours',
    maximumMarks: 100,
    passingMarks: 45,
    examPortion: 'All 5 Modules (Neural Networks, ML Algorithms, NLP, Reinforcement Learning)',
    hallNumber: 'Exam Hall 3B',
    seatNumberPrefix: 'A-',
    examBlock: 'Block 1',
    invigilator: 'Dr. Alan Turing'
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/exams');
      if (data.success) setExams(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/exams', formData);
      if (data.success) {
        setShowCreateModal(false);
        fetchExams();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating exam.');
    }
  };

  const handleDownloadHallTicket = async (examId) => {
    try {
      const response = await API.get(`/exams/hall-ticket/${examId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HallTicket_${user?.rollNumber || 'EXAM'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download Hall Ticket. Please try again.');
    }
  };

  const handleFetchAIPrep = async (examId) => {
    try {
      const { data } = await API.get(`/exams/${examId}/ai-prep`);
      if (data.success) {
        setAiPrepModal(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white gradient-text">
            Examination Portal & Hall Tickets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official examination schedules, portion guides, Hall Ticket PDF downloads, and AI revision planners.
          </p>
        </div>

        {isStaffOrAdmin ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-btn flex items-center space-x-2 text-xs font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule / Update Exam & Hall Ticket</span>
          </button>
        ) : (
          <span className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
            Student Portal: Exam View & Download Hall Ticket
          </span>
        )}
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <motion.div
            key={exam._id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 uppercase tracking-wider">
                  {exam.category} Exam
                </span>
                <span className="text-xs font-mono font-bold text-primary">{exam.subjectCode}</span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2">{exam.examName}</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">{exam.subject}</p>

              <div className="my-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{exam.examDate} • {exam.examTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hall & Seat Prefix</span>
                  <span className="font-semibold text-primary">{exam.hallNumber} ({exam.examBlock} • {exam.seatNumberPrefix || 'A-'})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Portion</span>
                  <span className="text-right text-slate-300 line-clamp-1">{exam.examPortion}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => handleFetchAIPrep(exam._id)}
                className="px-3 py-1.5 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 text-xs font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Revision Plan</span>
              </button>

              <button
                onClick={() => handleDownloadHallTicket(exam._id)}
                className="px-4 py-2 rounded-xl gradient-btn text-xs font-semibold flex items-center space-x-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Hall Ticket</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Staff Schedule / Update Exam Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg gradient-text">Schedule Exam & Issue Hall Tickets</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExam} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={formData.examName}
                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
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
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date</label>
                    <input
                      type="date"
                      required
                      value={formData.examDate}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam Time</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 AM - 01:00 PM"
                      value={formData.examTime}
                      onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Hall Number</label>
                    <input
                      type="text"
                      value={formData.hallNumber}
                      onChange={(e) => setFormData({ ...formData, hallNumber: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Exam Block</label>
                    <input
                      type="text"
                      value={formData.examBlock}
                      onChange={(e) => setFormData({ ...formData, examBlock: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Seat Prefix</label>
                    <input
                      type="text"
                      value={formData.seatNumberPrefix}
                      onChange={(e) => setFormData({ ...formData, seatNumberPrefix: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exam Portion / Modules</label>
                  <textarea
                    rows={3}
                    value={formData.examPortion}
                    onChange={(e) => setFormData({ ...formData, examPortion: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl gradient-btn text-xs font-semibold">
                  Publish Exam & Update Hall Tickets
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Prep Planner Modal */}
      <AnimatePresence>
        {aiPrepModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-base gradient-text">AI Revision Strategy</h3>
                <button onClick={() => setAiPrepModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-4 text-xs">
                <div>
                  <h4 className="font-bold text-secondary uppercase tracking-wider mb-2">High-Yield Important Topics</h4>
                  <ul className="space-y-1 text-slate-300">
                    {aiPrepModal.importantTopics?.map((t, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-secondary font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-accent uppercase tracking-wider mb-2">3-Day Revision Plan</h4>
                  <div className="space-y-2">
                    {aiPrepModal.revisionPlan?.map((plan, pIdx) => (
                      <div key={pIdx} className="p-2.5 bg-white/40 dark:bg-slate-800/40 rounded-xl">
                        <span className="font-bold text-primary block">{plan.day}</span>
                        <span className="text-slate-400">{plan.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
