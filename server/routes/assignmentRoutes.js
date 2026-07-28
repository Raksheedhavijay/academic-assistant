const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getSubmissionsForAssignment,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getAIStudyPlan
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getAssignments);
router.get('/:id/submissions', protect, authorize('staff', 'admin'), getSubmissionsForAssignment);
router.post('/', protect, authorize('staff', 'admin'), upload.single('assignmentFile'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.single('submissionFile'), submitAssignment);
router.put('/submission/:id/grade', protect, authorize('staff', 'admin'), gradeSubmission);
router.get('/:id/ai-study-plan', protect, getAIStudyPlan);

module.exports = router;
