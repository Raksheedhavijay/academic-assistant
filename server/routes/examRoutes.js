const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  issueHallTicket,
  downloadHallTicketPDF,
  getAIExamPrep
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getExams);
router.post('/', protect, authorize('staff', 'admin'), createExam);
router.post('/:id/issue-hall-ticket', protect, authorize('staff', 'admin'), issueHallTicket);
router.get('/hall-ticket/:id/pdf', downloadHallTicketPDF); // Handled internally with query token fallback
router.get('/:id/ai-prep', protect, getAIExamPrep);

module.exports = router;
