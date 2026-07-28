const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true, default: 'A' },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  staffName: { type: String, required: true },
  staffId: { type: String, required: true },
  classroom: { type: String, required: true },
  day: { 
    type: String, 
    required: true, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
  },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "10:00"
  studentsRollNumbers: [{ type: String }],
  studentsNames: [{ type: String }],
  topicToBeCovered: { type: String, default: '' },
  lectureType: { 
    type: String, 
    required: true, 
    enum: ['Theory', 'Lab', 'Seminar', 'Practical'],
    default: 'Theory'
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
