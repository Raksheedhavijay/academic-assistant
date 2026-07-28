const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null means all users or role-based
  targetRole: { type: String, enum: ['all', 'student', 'staff', 'admin'], default: 'all' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Assignment', 'Attendance', 'Class', 'Exam', 'HallTicket', 'Study', 'Deadline', 'System'],
    default: 'System' 
  },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
