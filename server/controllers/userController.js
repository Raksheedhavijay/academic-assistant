const User = require('../models/User');

// @desc    Get all users or filter by role (Admin only)
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile or role (Admin or Self)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, department, semester, section, phone, role } = req.body;
    
    // Non-admin users cannot change their role
    const updateData = { name, department, semester, section, phone };
    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User (Admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser
};
