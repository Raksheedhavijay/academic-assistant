const mongoose = require('mongoose');

const hallTicketSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  department: { type: String, default: 'CSE' },
  semester: { type: Number, default: 6 },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  examName: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  examDate: { type: String, required: true },
  examTime: { type: String, required: true },
  hallNumber: { type: String, required: true },
  seatNumber: { type: String, required: true },
  examBlock: { type: String, default: 'Block 1' },
  qrCodeData: { type: String, default: '' },
  isIssued: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HallTicket', hallTicketSchema);
