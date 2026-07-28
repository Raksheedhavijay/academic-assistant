const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  submissionFileUrl: { type: String, default: '' },
  submissionText: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  marksObtained: { type: Number, default: null },
  status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' },
  feedback: { type: String, default: '' },
  similarityScore: { type: Number, default: 98 } // AI similarity score placeholder
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
