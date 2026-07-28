const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  notes: { type: String, default: '' },
  studyTime: { type: String, default: '19:00 - 20:30' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  completionStatus: { 
    type: String, 
    enum: ['Pending', 'Finished', 'Need time to study'],
    default: 'Pending' 
  },
  estimatedHours: { type: Number, default: 2, min: 1, max: 24 },
  actualHours: { type: Number, default: 0, min: 0, max: 24 },
  deadline: { type: Date, required: true },
  aiRecommendation: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
