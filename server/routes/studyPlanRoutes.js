const express = require('express');
const router = express.Router();
const {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('student', 'staff', 'admin'), getStudyPlans);
router.post('/', protect, authorize('student'), createStudyPlan);
router.put('/:id', protect, authorize('student', 'staff', 'admin'), updateStudyPlan);
router.delete('/:id', protect, authorize('student', 'staff', 'admin'), deleteStudyPlan);

module.exports = router;
