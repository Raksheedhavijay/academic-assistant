const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, default: 'A' },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  hour: { type: Number, required: true, default: 1 },
  timing: { type: String, default: '09:00 - 10:00' },
  attendanceStatus: { 
    type: String, 
    required: true, 
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  },
  reasonForAbsence: { type: String, default: '' },
  medicalCertificateUrl: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
