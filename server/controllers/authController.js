const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'academic_ai_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Student, Staff, or Admin)
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, staffId, department, semester, section, phone } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate random 6-digit OTP for email verification
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      rollNumber: rollNumber || (role === 'student' ? '21CSE0' + Math.floor(10 + Math.random() * 89) : ''),
      staffId: staffId || (role === 'staff' ? 'STF' + Math.floor(100 + Math.random() * 899) : ''),
      department: department || 'Computer Science & Engineering',
      semester: semester || 6,
      section: section || 'A',
      phone: phone || '',
      isVerified: true, // Set true by default for smooth immediate test login, with OTP verification endpoint ready
      otpCode,
      otpExpires
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        staffId: user.staffId,
        department: user.department,
        semester: user.semester,
        section: user.section,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate User & Get Token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        staffId: user.staffId,
        department: user.department,
        semester: user.semester,
        section: user.section,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password - Generate OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({
      success: true,
      message: `Password reset OTP has been generated. Demo OTP Code: ${otpCode}`,
      otpCode // Returned for visual testing convenience in UI demo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.otpCode !== otpCode || new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.otpCode !== otpCode) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    user.isVerified = true;
    user.otpCode = null;
    await user.save();

    res.json({ success: true, message: 'Email address verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyOTP,
  getMe
};
