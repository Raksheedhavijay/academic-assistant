import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  Target,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import PomodoroTimer from '../../components/ui/PomodoroTimer';
import StudyHeatmap from '../../components/ui/StudyHeatmap';

export default function StudyPlannerPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState({ progressPct: 33, learningStreakDays: 7, totalTargetHours: 12, completedHours: 4 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const isStudent = user?.role === 'student';

  const [formData, setFormData] = useState({
    subject: 'Artificial Intelligence & Machine Learning',
    topic: 'Neural Network Backpropagation & Derivatives',
    notes: 'Focus on cross-entropy loss gradient calculations.',
    studyTime: '19:00 - 21:00',
    priority: 'High',
    completionStatus: 'Pending',
    estimatedHours: 4,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/study-planner');
      if (data.success) {
        setPlans(data.data);
        if (data.analytics) setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!isStudent) {
      alert('Only students can create study planner goals.');
      return;
    }
    try {
      const { data } = await API.post('/study-planner', formData);
      if (data.success) {
        setShowAddModal(false);
        fetchPlans();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add study plan task.');
    }
  };

  const handleStatusChange = async (planId, newStatus) => {
    try {
      const { data } = await API.put(`/study-planner/${planId}`, { completionStatus: newStatus });
      if (data.success) fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await API.delete(`/study-planner/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white gradient-text">
            Personalized AI Study Planner
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build custom study targets (up to 24hrs), track Pomodoro focus sessions, learning streaks, and status updates.
          </p>
        </div>

        {isStudent ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-btn flex items-center space-x-2 text-xs font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Study Goal</span>
          </button>
        ) : (
          <span className="px-3.5 py-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold">
            Staff View: Monitoring Student Study Planners
          </span>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-700/60 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Learning Streak</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{analytics.learningStreakDays} Days 🔥</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-700/60 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Target Study Hours</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{analytics.completedHours} / {analytics.totalTargetHours} Hrs</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-white/20 dark:border-slate-700/60 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">AI Recommended Topic</span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {analytics.aiRecommendedNextTopic || 'Neural Networks'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks & Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              {isStudent ? "My Study Tasks & Goals" : "All Student Study Planner Records"}
            </h3>

            <div className="space-y-3">
              {plans.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No study goals added yet.</p>
              ) : (
                plans.map((plan) => {
                  const isFinished = plan.completionStatus === 'Finished' || plan.completionStatus === 'Completed';
                  const isNeedTime = plan.completionStatus === 'Need time to study';

                  return (
                    <div
                      key={plan._id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isFinished
                          ? 'bg-success/5 border-success/30'
                          : isNeedTime
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-white/40 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          <BrainCircuit className={`w-5 h-5 ${isFinished ? 'text-success' : isNeedTime ? 'text-amber-500' : 'text-primary'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-bold text-sm text-slate-900 dark:text-white ${isFinished ? 'line-through opacity-75' : ''}`}>
                              {plan.topic}
                            </h4>
                            {plan.student && !isStudent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                {plan.student.name} ({plan.student.rollNumber})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {plan.subject} • Target: <strong className="text-primary">{plan.estimatedHours} Hrs</strong> (Timing: {plan.studyTime || '24hr Plan'})
                          </p>
                          {plan.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{plan.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Status Select dropdown */}
                        <select
                          value={plan.completionStatus || 'Pending'}
                          onChange={(e) => handleStatusChange(plan._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            plan.completionStatus === 'Finished'
                              ? 'bg-success/20 text-success border border-success/30'
                              : plan.completionStatus === 'Need time to study'
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <option value="Pending" className="bg-slate-900">Pending</option>
                          <option value="Finished" className="bg-slate-900">Finished</option>
                          <option value="Need time to study" className="bg-slate-900">Need time to study</option>
                        </select>

                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-2 text-slate-400 hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pomodoro & Heatmap */}
        <div className="space-y-6">
          <PomodoroTimer />
          <StudyHeatmap data={analytics.heatmap} />
        </div>
      </div>

      {/* Add Study Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg gradient-text">Create Student Study Goal</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Topic Name</label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Hours (Up to 24 Hrs)</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: Math.min(24, Math.max(1, Number(e.target.value))) })}
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Study Status</label>
                    <select
                      value={formData.completionStatus}
                      onChange={(e) => setFormData({ ...formData, completionStatus: e.target.value })}
                      className="w-full glass-input text-xs"
                    >
                      <option value="Pending" className="bg-slate-900">Pending</option>
                      <option value="Finished" className="bg-slate-900">Finished</option>
                      <option value="Need time to study" className="bg-slate-900">Need time to study</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Study Time Slot (24hr)</label>
                    <input
                      type="text"
                      placeholder="e.g. 14:00 - 18:00"
                      value={formData.studyTime}
                      onChange={(e) => setFormData({ ...formData, studyTime: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Personal Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl gradient-btn text-xs font-semibold">
                  Save Study Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
