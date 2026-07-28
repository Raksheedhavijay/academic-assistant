const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'student'], default: 'student' },
  rollNumber: { type: String, trim: true, default: '' },
  staffId: { type: String, trim: true, default: '' },
  department: { type: String, default: 'Computer Science & Engineering' },
  semester: { type: Number, default: 6 },
  section: { type: String, default: 'A' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: true },
  otpCode: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
