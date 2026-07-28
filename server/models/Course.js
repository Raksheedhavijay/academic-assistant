const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  durationYears: { type: Number, default: 4 },
  totalSemesters: { type: Number, default: 8 }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
