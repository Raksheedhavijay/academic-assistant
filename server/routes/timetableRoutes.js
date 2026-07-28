const express = require('express');
const router = express.Router();
const {
  getTimetable,
  createTimetableSlot,
  aiSuggestSchedule,
  updateTimetableSlot,
  deleteTimetableSlot
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getTimetable);
router.post('/', protect, authorize('staff', 'admin'), createTimetableSlot);
router.post('/ai-suggest', protect, authorize('staff', 'admin'), aiSuggestSchedule);
router.put('/:id', protect, authorize('staff', 'admin'), updateTimetableSlot);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteTimetableSlot);

module.exports = router;
