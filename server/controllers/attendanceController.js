const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get attendance records (Students view their own; Staff/Admin view all/filtered)
// @route   GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const { rollNumber, subjectCode, date, attendanceStatus } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.rollNumber = req.user.rollNumber || '21CSE045';
    } else if (rollNumber) {
      query.rollNumber = rollNumber;
    }

    if (subjectCode) query.subjectCode = subjectCode;
    if (date) query.date = date;
    if (attendanceStatus) query.attendanceStatus = attendanceStatus;

    const records = await Attendance.find(query).sort({ date: -1 });

    // Calculate metrics
    const total = records.length;
    const presentCount = records.filter(r => r.attendanceStatus === 'Present' || r.attendanceStatus === 'Late').length;
    const absentCount = records.filter(r => r.attendanceStatus === 'Absent').length;
    const percentage = total > 0 ? Number(((presentCount / total) * 100).toFixed(1)) : 100;

    // AI Shortage Predictor & Classes Needed calculation
    let shortageWarning = false;
    let classesNeeded = 0;
    if (percentage < 75 && total > 0) {
      shortageWarning = true;
      // Formula: (presentCount + x) / (total + x) >= 0.75 => x >= (0.75 * total - presentCount) / 0.25
      classesNeeded = Math.max(0, Math.ceil((0.75 * total - presentCount) / 0.25));
    }

    res.json({
      success: true,
      data: records,
      analytics: {
        totalClasses: total,
        daysPresent: presentCount,
        daysAbsent: absentCount,
        percentage,
        shortageWarning,
        classesNeededToReach75: classesNeeded,
        target85Needed: Math.max(0, Math.ceil((0.85 * total - presentCount) / 0.15))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark / Update Attendance (Staff / Admin only)
// @route   POST /api/attendance
const markAttendance = async (req, res) => {
  try {
    const {
      studentName, rollNumber, department, semester, section,
      subject, subjectCode, date, hour, timing, attendanceStatus,
      reasonForAbsence, medicalCertificateUrl, remarks
    } = req.body;

    const studentUser = await User.findOne({ rollNumber });

    const attendanceRecord = await Attendance.create({
      studentId: studentUser ? studentUser._id : null,
      studentName: studentName || (studentUser ? studentUser.name : 'Unknown Student'),
      rollNumber,
      department: department || 'Computer Science & Engineering',
      semester: semester || 6,
      section: section || 'A',
      subject,
      subjectCode,
      date: date || new Date().toISOString().split('T')[0],
      hour: hour || 1,
      timing: timing || '09:00 - 10:00',
      attendanceStatus: attendanceStatus || 'Present',
      reasonForAbsence: reasonForAbsence || '',
      medicalCertificateUrl: medicalCertificateUrl || '',
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, message: 'Attendance recorded successfully', data: attendanceRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Medical Certificate for Absence
// @route   POST /api/attendance/upload-medical
const uploadMedicalCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Medical certificate uploaded successfully',
      fileUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  uploadMedicalCertificate
};
