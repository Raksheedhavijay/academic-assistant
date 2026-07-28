const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  credits: { type: Number, default: 4 },
  theoryHours: { type: Number, default: 3 },
  labHours: { type: Number, default: 2 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
