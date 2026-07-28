const { processAcademicQuery } = require('../services/aiEngineService');

// @desc    Process Floating AI Assistant Chat Request
// @route   POST /api/ai/chat
const handleAIChat = async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message || req.body.query;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt or message query is required' });
    }

    const userContext = req.user ? {
      name: req.user.name,
      role: req.user.role,
      department: req.user.department,
      semester: req.user.semester,
      rollNumber: req.user.rollNumber
    } : {};

    const response = await processAcademicQuery(prompt, userContext);
    res.json({ success: true, ...response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Summarize notes
// @route   POST /api/ai/summarize
const summarizeNotes = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text to summarize is required' });
    }

    const summary = `📌 Executive Academic Summary:\n\n• Key Premise: ${text.slice(0, 120)}...\n• Core Takeaway: Focus on primary formulas, definitions, and standard workflow patterns.\n• Exam Action Point: Memorize top 3 theorems and review practical code implementations.`;

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleAIChat,
  summarizeNotes
};
