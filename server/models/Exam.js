const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Internal', 'Model', 'Semester', 'Practical', 'University'],
    required: true 
  },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  examDate: { type: String, required: true },
  examTime: { type: String, required: true },
  duration: { type: String, default: '3 Hours' },
  maximumMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 45 },
  examPortion: { type: String, required: true },
  hallNumber: { type: String, required: true },
  seatNumberPrefix: { type: String, default: 'A-' },
  examBlock: { type: String, default: 'Block 1' },
  invigilator: { type: String, default: 'Dr. Alan Turing' },
  eligibleStudents: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
