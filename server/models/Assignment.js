const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assignmentTitle: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  staffName: { type: String, required: true },
  staffId: { type: String, default: '' },
  description: { type: String, required: true },
  assignmentPdfUrl: { type: String, default: '' },
  referenceFiles: [{ type: String }],
  marks: { type: Number, required: true, default: 100 },
  deadline: { type: Date, required: true },
  createdDate: { type: Date, default: Date.now },
  estimatedCompletionTime: { type: String, default: '3 hours' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
