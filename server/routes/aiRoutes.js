const express = require('express');
const router = express.Router();
const { handleAIChat, summarizeNotes } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, handleAIChat);
router.post('/summarize', protect, summarizeNotes);

module.exports = router;
