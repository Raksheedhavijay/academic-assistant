const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  uploadMedicalCertificate
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getAttendance);
router.post('/', protect, authorize('staff', 'admin'), markAttendance);
router.post('/upload-medical', protect, authorize('staff', 'admin'), upload.single('medicalCertificate'), uploadMedicalCertificate);

module.exports = router;
