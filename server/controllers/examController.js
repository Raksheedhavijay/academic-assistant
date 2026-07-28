const Exam = require('../models/Exam');
const HallTicket = require('../models/HallTicket');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateHallTicketPDF } = require('../services/pdfGeneratorService');

// @desc    Get exams (Filtered by student eligibility if role is student)
// @route   GET /api/exams
const getExams = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const studentRoll = req.user.rollNumber || '21CSE045';
      query = {
        $or: [
          { eligibleStudents: studentRoll },
          { eligibleStudents: 'ALL' },
          { eligibleStudents: { $exists: false } },
          { eligibleStudents: { $size: 0 } }
        ]
      };
    }

    const exams = await Exam.find(query).sort({ examDate: 1 });
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Exam (Staff / Admin only)
// @route   POST /api/exams
const createExam = async (req, res) => {
  try {
    const {
      examName, category, subject, subjectCode, examDate, examTime,
      duration, maximumMarks, passingMarks, examPortion, hallNumber,
      seatNumberPrefix, examBlock, invigilator, eligibleStudents
    } = req.body;

    const exam = await Exam.create({
      examName,
      category: category || 'Internal',
      subject,
      subjectCode,
      examDate,
      examTime,
      duration: duration || '3 Hours',
      maximumMarks: maximumMarks || 100,
      passingMarks: passingMarks || 45,
      examPortion,
      hallNumber,
      seatNumberPrefix: seatNumberPrefix || 'A-',
      examBlock: examBlock || 'Block 1',
      invigilator: invigilator || 'Prof. Alan Turing',
      eligibleStudents: eligibleStudents || ['ALL']
    });

    res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue / Assign Hall Ticket to Student (Staff / Admin or Auto-generation)
// @route   POST /api/exams/:id/issue-hall-ticket
const issueHallTicket = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const targetStudentId = req.body.studentId || req.user._id;
    const targetUser = await User.findById(targetStudentId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    let hallTicket = await HallTicket.findOne({ student: targetUser._id, exam: exam._id });
    if (!hallTicket) {
      const seatNumber = `${exam.seatNumberPrefix || 'A-'}${Math.floor(10 + Math.random() * 89)}`;
      hallTicket = await HallTicket.create({
        student: targetUser._id,
        rollNumber: targetUser.rollNumber || '21CSE045',
        studentName: targetUser.name,
        department: targetUser.department || 'CSE',
        semester: targetUser.semester || 6,
        exam: exam._id,
        examName: exam.examName,
        subject: exam.subject,
        subjectCode: exam.subjectCode,
        examDate: exam.examDate,
        examTime: exam.examTime,
        hallNumber: exam.hallNumber,
        seatNumber,
        examBlock: exam.examBlock,
        qrCodeData: `HT-${exam._id}-${targetUser._id}`,
        isIssued: true
      });
    }

    res.json({ success: true, message: 'Hall Ticket issued', data: hallTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Hall Ticket PDF
// @route   GET /api/exams/hall-ticket/:id/pdf
const downloadHallTicketPDF = async (req, res) => {
  try {
    // Check authorization from Bearer or query token
    let currentUser = req.user;
    if (!currentUser && req.query.token) {
      try {
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET || 'academic_ai_secret_key_2026');
        currentUser = await User.findById(decoded.id).select('-password');
      } catch (err) {
        console.error('PDF token error:', err.message);
      }
    }

    const identifier = req.params.id;

    // Search by HallTicket ID or Exam ID
    let hallTicket = await HallTicket.findById(identifier);

    if (!hallTicket) {
      const exam = await Exam.findById(identifier);
      if (exam) {
        // Auto-find or create for the student
        const studentUser = currentUser || (await User.findOne({ role: 'student' }));
        hallTicket = await HallTicket.findOne({ student: studentUser._id, exam: exam._id });

        if (!hallTicket) {
          hallTicket = await HallTicket.create({
            student: studentUser._id,
            rollNumber: studentUser.rollNumber || '21CSE045',
            studentName: studentUser.name,
            department: studentUser.department || 'CSE',
            semester: studentUser.semester || 6,
            exam: exam._id,
            examName: exam.examName,
            subject: exam.subject,
            subjectCode: exam.subjectCode,
            examDate: exam.examDate,
            examTime: exam.examTime,
            hallNumber: exam.hallNumber,
            seatNumber: `${exam.seatNumberPrefix || 'A-'}${Math.floor(10 + Math.random() * 89)}`,
            examBlock: exam.examBlock,
            qrCodeData: `HT-${exam._id}-${studentUser._id}`,
            isIssued: true
          });
        }
      }
    }

    if (!hallTicket) {
      return res.status(404).json({ success: false, message: 'Hall Ticket record not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=HallTicket_${hallTicket.subjectCode || 'EXAM'}.pdf`);

    generateHallTicketPDF(hallTicket, res);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Revision Planner & Important Topics
// @route   GET /api/exams/:id/ai-prep
const getAIExamPrep = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({
      success: true,
      examName: exam.examName,
      importantTopics: [
        'Fundamental Theorems & Mathematical Proofs',
        'State Machine Models & Complexity Analysis',
        'Real-world Application Case Studies',
        'System Architecture & Flowchart Diagrams'
      ],
      revisionPlan: [
        { day: 'Day 1', task: 'Review Module 1 & 2 Core Concepts' },
        { day: 'Day 2', task: 'Solve Previous Semester Question Papers' },
        { day: 'Day 3', task: 'Formula Sheet & Flashcard Memory Drill' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getExams,
  createExam,
  issueHallTicket,
  downloadHallTicketPDF,
  getAIExamPrep
};
