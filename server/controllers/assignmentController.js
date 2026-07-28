const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { generatePersonalizedStudyPlan } = require('../services/aiEngineService');

// @desc    Get all assignments
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ deadline: 1 });

    // Fetch user's submissions if student, or all submissions if staff/admin
    let submissions = [];
    if (req.user.role === 'student') {
      submissions = await AssignmentSubmission.find({ student: req.user._id });
    } else {
      submissions = await AssignmentSubmission.find().populate('assignment').sort({ submittedAt: -1 });
    }

    res.json({ success: true, count: assignments.length, data: assignments, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get submissions for a specific assignment (Staff / Admin)
// @route   GET /api/assignments/:id/submissions
const getSubmissionsForAssignment = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate('student', 'name rollNumber department semester section')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new assignment (Staff / Admin)
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const {
      assignmentTitle, subject, subjectCode, description,
      marks, deadline, estimatedCompletionTime, priority
    } = req.body;

    let assignmentPdfUrl = '';
    if (req.file) {
      assignmentPdfUrl = `/uploads/${req.file.filename}`;
    }

    const assignment = await Assignment.create({
      assignmentTitle,
      subject,
      subjectCode,
      staffName: req.user.name,
      staffId: req.user.staffId || 'STF101',
      description,
      assignmentPdfUrl,
      marks: marks || 100,
      deadline: new Date(deadline),
      estimatedCompletionTime: estimatedCompletionTime || '3 hours',
      priority: priority || 'Medium'
    });

    res.status(201).json({ success: true, message: 'Assignment created successfully', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Assignment (Student)
// @route   POST /api/assignments/:id/submit
const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { submissionText } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submissionFileUrl = '';
    if (req.file) {
      submissionFileUrl = `/uploads/${req.file.filename}`;
    }

    const isLate = new Date() > new Date(assignment.deadline);

    // AI Similarity / Plagiarism analysis simulation
    const simulatedOriginalityScore = Math.floor(92 + Math.random() * 8);

    const submission = await AssignmentSubmission.create({
      assignment: assignmentId,
      student: req.user._id,
      studentName: req.user.name,
      rollNumber: req.user.rollNumber || '21CSE045',
      submissionFileUrl,
      submissionText: submissionText || '',
      status: isLate ? 'Late' : 'Submitted',
      similarityScore: simulatedOriginalityScore
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Assignment submitted late.' : 'Assignment submitted successfully!',
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade & Update Assignment Submission Status (Staff / Admin)
// @route   PUT /api/assignments/submission/:id/grade
const gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback, status } = req.body;
    const updateData = {
      feedback: feedback || '',
      status: status || 'Graded'
    };
    if (marksObtained !== undefined && marksObtained !== null) {
      updateData.marksObtained = Number(marksObtained);
    }

    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, message: 'Submission status updated successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Generate Study Plan for Assignment
// @route   GET /api/assignments/:id/ai-study-plan
const getAIStudyPlan = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const daysLeft = Math.max(1, Math.ceil((new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
    const plan = generatePersonalizedStudyPlan(assignment.subject, daysLeft);

    res.json({ success: true, studyPlan: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignments,
  getSubmissionsForAssignment,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getAIStudyPlan
};
