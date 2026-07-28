import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Upload, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  BrainCircuit,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(null); // assignment object
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(null); // assignment object for staff review
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiPlanModal, setAiPlanModal] = useState(null); // plan object

  // Staff assignment creation state
  const [formData, setFormData] = useState({
    assignmentTitle: 'Convolutional Neural Networks Implementation',
    subject: 'Artificial Intelligence & Machine Learning',
    subjectCode: 'CS601',
    description: 'Implement a 3-layer CNN architecture on CIFAR-10 image dataset using PyTorch or TensorFlow.',
    marks: 100,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedCompletionTime: '4 hours',
    priority: 'High'
  });

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/assignments');
      if (data.success) {
        setAssignments(data.data);
        if (data.submissions) setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/assignments', formData);
      if (data.success) {
        setShowCreateModal(false);
        fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment.');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!showSubmitModal) return;
    setSubmitting(true);

    try {
      const { data } = await API.post(`/assignments/${showSubmitModal._id}/submit`, {
        submissionText
      });
      if (data.success) {
        alert(`✅ Assignment Submitted! Similarity Check: ${data.data.similarityScore}% Originality`);
        setShowSubmitModal(null);
        setSubmissionText('');
        fetchAssignments();
      }
    } catch (err) {
      alert('Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFetchAIPlan = async (asgId) => {
    try {
      const { data } = await API.get(`/assignments/${asgId}/ai-study-plan`);
      if (data.success) {
        setAiPlanModal(data.studyPlan);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white gradient-text">
            Assignment Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track coursework deadlines, submit solutions, view AI similarity checks & study plans.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-btn flex items-center space-x-2 text-xs font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((asg) => {
          const userSub = submissions.find(s => s.assignment === asg._id);
          const isSubmitted = !!userSub;

          return (
            <motion.div
              key={asg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-700/60 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    asg.priority === 'High' ? 'bg-danger/20 text-danger border border-danger/30' : 'bg-primary/20 text-primary border border-primary/30'
                  }`}>
                    {asg.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-slate-400">{asg.subjectCode}</span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2">{asg.assignmentTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{asg.description}</p>

                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Marks</span>
                    <span className="font-bold text-primary">{asg.marks} Points</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Completion</span>
                    <span className="font-bold text-accent">{asg.estimatedCompletionTime}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px]">Deadline</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {new Date(asg.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFetchAIPlan(asg._id)}
                    className="p-2 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                    title="Generate AI Study Breakdown"
                  >
                    <BrainCircuit className="w-4 h-4" />
                  </button>

                  {isStaffOrAdmin && (
                    <button
                      onClick={() => setShowSubmissionsModal(asg)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-semibold flex items-center space-x-1"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Review Submissions ({submissions.filter(s => s.assignment === asg._id || s.assignment?._id === asg._id).length})</span>
                    </button>
                  )}

                  {user?.role === 'student' && (
                    isSubmitted ? (
                      <span className="px-3 py-1.5 rounded-xl bg-success/20 text-success border border-success/30 text-xs font-bold flex items-center space-x-1">
                        <FileCheck className="w-4 h-4" />
                        <span>{userSub.status || 'Submitted'} ({userSub.similarityScore}% Original)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowSubmitModal(asg)}
                        className="px-4 py-2 rounded-xl gradient-btn text-xs font-semibold flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Submit Work</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Staff Review Submissions & Update Status Modal */}
      <AnimatePresence>
        {showSubmissionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-lg gradient-text">Review Student Submissions</h3>
                  <p className="text-xs text-slate-400">{showSubmissionsModal.assignmentTitle} ({showSubmissionsModal.subjectCode})</p>
                </div>
                <button onClick={() => setShowSubmissionsModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-4">
                {submissions.filter(s => s.assignment === showSubmissionsModal._id || s.assignment?._id === showSubmissionsModal._id).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No student submissions uploaded for this assignment yet.</p>
                ) : (
                  submissions
                    .filter(s => s.assignment === showSubmissionsModal._id || s.assignment?._id === showSubmissionsModal._id)
                    .map((sub) => (
                      <div key={sub._id} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{sub.studentName}</span>
                            <span className="text-xs text-slate-400 font-mono ml-2">({sub.rollNumber})</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 p-3 bg-slate-900/60 rounded-xl font-mono overflow-x-auto whitespace-pre-wrap">
                          {sub.submissionText || 'No text note provided.'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/50">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Marks (Max: {showSubmissionsModal.marks})</label>
                            <input
                              type="number"
                              defaultValue={sub.marksObtained || ''}
                              id={`marks-${sub._id}`}
                              className="w-full glass-input text-xs"
                              placeholder="Marks"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Update Status</label>
                            <select
                              defaultValue={sub.status || 'Graded'}
                              id={`status-${sub._id}`}
                              className="w-full glass-input text-xs"
                            >
                              <option value="Submitted" className="bg-slate-900">Submitted</option>
                              <option value="Graded" className="bg-slate-900">Graded</option>
                              <option value="Needs Revision" className="bg-slate-900">Needs Revision</option>
                              <option value="Late" className="bg-slate-900">Late</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Staff Feedback</label>
                            <input
                              type="text"
                              defaultValue={sub.feedback || ''}
                              id={`feedback-${sub._id}`}
                              className="w-full glass-input text-xs"
                              placeholder="Feedback..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={async () => {
                              const marks = document.getElementById(`marks-${sub._id}`).value;
                              const status = document.getElementById(`status-${sub._id}`).value;
                              const feedback = document.getElementById(`feedback-${sub._id}`).value;
                              try {
                                const { data } = await API.put(`/assignments/submission/${sub._id}/grade`, {
                                  marksObtained: marks,
                                  status,
                                  feedback
                                });
                                if (data.success) {
                                  alert('✅ Submission status & grades updated successfully!');
                                  fetchAssignments();
                                }
                              } catch (err) {
                                alert('Error updating submission.');
                              }
                            }}
                            className="px-4 py-2 rounded-xl gradient-btn text-xs font-semibold"
                          >
                            Save Grade & Status
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg gradient-text">Submit Assignment</h3>
                <button onClick={() => setShowSubmitModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Submission Notes / Code Output</label>
                  <textarea
                    rows={5}
                    required
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Paste code repository links, notebook summaries, or written answers..."
                    className="w-full glass-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl gradient-btn text-xs font-semibold"
                >
                  {submitting ? 'Running AI Originality Check & Submitting...' : 'Confirm Submission'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Study Plan Modal */}
      <AnimatePresence>
        {aiPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-base gradient-text">AI Study Breakdown</h3>
                </div>
                <button onClick={() => setAiPlanModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                {aiPlanModal.recommendedSchedule?.map((step) => (
                  <div key={step.day} className="p-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Day {step.day}: {step.focus}</span>
                      <span className="text-accent">{step.hours} Hrs</span>
                    </div>
                    <p className="text-slate-400 mt-1">{step.topics.join(' • ')}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
