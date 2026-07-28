const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const StudyPlan = require('../models/StudyPlan');

// @desc    Global Natural Language Search across modules
// @route   GET /api/search
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        results: { students: [], staff: [], assignments: [], exams: [], subjects: [], timetable: [] }
      });
    }

    const regex = new RegExp(q, 'i');
    const isStudent = req.user && req.user.role === 'student';

    let studentFields = isStudent ? 'name rollNumber department' : '-password';

    const [rawStudents, staff, assignments, exams, subjects, timetable] = await Promise.all([
      User.find({ role: 'student', $or: [{ name: regex }, { rollNumber: regex }, { department: regex }] }).select(studentFields).limit(10),
      User.find({ role: 'staff', $or: [{ name: regex }, { staffId: regex }, { department: regex }] }).select('-password').limit(10),
      Assignment.find({ $or: [{ assignmentTitle: regex }, { subject: regex }, { subjectCode: regex }] }).limit(10),
      Exam.find({ $or: [{ examName: regex }, { subject: regex }, { subjectCode: regex }, { hallNumber: regex }] }).limit(10),
      Subject.find({ $or: [{ subjectName: regex }, { subjectCode: regex }] }).limit(10),
      Timetable.find({ $or: [{ subjectName: regex }, { subjectCode: regex }, { staffName: regex }, { classroom: regex }] }).limit(10)
    ]);

    let students = rawStudents;

    // For staff/admin, populate detailed metrics for searched students (attendance rate, study planner, timetable, assignments)
    if (!isStudent && rawStudents.length > 0) {
      students = await Promise.all(
        rawStudents.map(async (st) => {
          const stObj = st.toObject();
          
          // Attendance rate
          const attRecords = await Attendance.find({ rollNumber: st.rollNumber });
          const totalAtt = attRecords.length;
          const presentAtt = attRecords.filter(r => r.attendanceStatus === 'Present' || r.attendanceStatus === 'Late').length;
          stObj.attendanceRate = totalAtt > 0 ? Number(((presentAtt / totalAtt) * 100).toFixed(1)) : 100;

          // Study planner status
          const plans = await StudyPlan.find({ student: st._id });
          stObj.studyPlannerCount = plans.length;
          stObj.studyPlans = plans.map(p => ({ topic: p.topic, completionStatus: p.completionStatus, estimatedHours: p.estimatedHours }));

          // Timetable slots count
          const ttSlots = await Timetable.find({
            department: st.department,
            semester: st.semester,
            $or: [{ section: st.section }, { studentsRollNumbers: st.rollNumber }]
          });
          stObj.timetableSlotsCount = ttSlots.length;

          // Assigned assignments
          const asgs = await Assignment.find({ department: st.department });
          stObj.assignmentsCount = asgs.length;

          return stObj;
        })
      );
    }

    res.json({
      success: true,
      query: q,
      results: {
        students,
        staff,
        assignments,
        exams,
        subjects,
        timetable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { globalSearch };
