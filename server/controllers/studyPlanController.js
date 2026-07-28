const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

// @desc    Get student's study plans & analytics (Staff can view all or filtered by student)
// @route   GET /api/study-planner
const getStudyPlans = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { student: req.user._id };
    } else if (req.query.studentId) {
      query = { student: req.query.studentId };
    } else if (req.query.rollNumber) {
      const studentUser = await User.findOne({ rollNumber: req.query.rollNumber });
      if (studentUser) {
        query = { student: studentUser._id };
      }
    }

    const plans = await StudyPlan.find(query)
      .populate('student', 'name rollNumber department semester section')
      .sort({ deadline: 1 });

    const totalTargetHours = plans.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
    const completedHours = plans
      .filter(p => p.completionStatus === 'Finished' || p.completionStatus === 'Completed')
      .reduce((sum, p) => sum + (p.actualHours || p.estimatedHours || 0), 0);

    const completedCount = plans.filter(p => p.completionStatus === 'Finished' || p.completionStatus === 'Completed').length;
    const streakDays = completedCount > 0 ? 7 : 0;

    const heatmap = Array.from({ length: 28 }, (_, i) => ({
      dayIndex: i,
      intensity: Math.floor(Math.random() * 4)
    }));

    res.json({
      success: true,
      count: plans.length,
      data: plans,
      analytics: {
        totalTargetHours,
        completedHours,
        progressPct: totalTargetHours > 0 ? Math.round((completedHours / totalTargetHours) * 100) : 0,
        learningStreakDays: streakDays,
        heatmap,
        aiRecommendedNextTopic: plans.find(p => p.completionStatus !== 'Finished' && p.completionStatus !== 'Completed')?.topic || 'Neural Network Optimization'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create study plan entry (Students only)
// @route   POST /api/study-planner
const createStudyPlan = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can create study planner entries.' });
    }

    const { subject, topic, notes, studyTime, priority, estimatedHours, deadline, completionStatus } = req.body;

    const validStatus = ['Pending', 'Finished', 'Need time to study'].includes(completionStatus)
      ? completionStatus
      : 'Pending';

    const hours = Math.min(24, Math.max(1, Number(estimatedHours) || 2));

    const plan = await StudyPlan.create({
      student: req.user._id,
      subject,
      topic,
      notes: notes || '',
      studyTime: studyTime || '09:00 - 11:00',
      priority: priority || 'Medium',
      completionStatus: validStatus,
      estimatedHours: hours,
      deadline: deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      aiRecommendation: `AI Suggestion: Break this ${hours}-hour session into focused intervals with active recall practice.`
    });

    res.status(201).json({ success: true, message: 'Study plan task added', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status or study log
// @route   PUT /api/study-planner/:id
const updateStudyPlan = async (req, res) => {
  try {
    const filter = req.user.role === 'student'
      ? { _id: req.params.id, student: req.user._id }
      : { _id: req.params.id };

    if (req.body.estimatedHours) {
      req.body.estimatedHours = Math.min(24, Math.max(1, Number(req.body.estimatedHours)));
    }
    if (req.body.actualHours) {
      req.body.actualHours = Math.min(24, Math.max(0, Number(req.body.actualHours)));
    }

    const plan = await StudyPlan.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Study plan entry not found' });
    }
    res.json({ success: true, message: 'Study plan updated', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete study plan task
// @route   DELETE /api/study-planner/:id
const deleteStudyPlan = async (req, res) => {
  try {
    const filter = req.user.role === 'student'
      ? { _id: req.params.id, student: req.user._id }
      : { _id: req.params.id };

    await StudyPlan.findOneAndDelete(filter);
    res.json({ success: true, message: 'Study plan task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan
};
