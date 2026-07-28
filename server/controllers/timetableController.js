const Timetable = require('../models/Timetable');
const { recommendOptimalSchedule } = require('../services/aiEngineService');

// @desc    Get all timetable slots with optional search & filter
// @route   GET /api/timetable
const getTimetable = async (req, res) => {
  try {
    const { day, department, semester, section, lectureType, search } = req.query;
    const query = {};

    if (req.user && req.user.role === 'student') {
      query.department = department || req.user.department;
      query.semester = semester ? Number(semester) : req.user.semester;
      if (req.user.section) {
        query.$or = [
          { section: req.user.section },
          { studentsRollNumbers: req.user.rollNumber }
        ];
      }
    } else {
      if (department) query.department = department;
      if (semester) query.semester = Number(semester);
      if (section) query.section = section;
    }

    if (day) query.day = day;
    if (lectureType) query.lectureType = lectureType;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { subjectName: searchRegex },
        { subjectCode: searchRegex },
        { staffName: searchRegex },
        { classroom: searchRegex },
        { topicToBeCovered: searchRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const timetable = await Timetable.find(query).sort({ day: 1, startTime: 1 });
    res.json({ success: true, count: timetable.length, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new timetable slot (Staff / Admin only)
// @route   POST /api/timetable
const createTimetableSlot = async (req, res) => {
  try {
    const {
      courseName, courseCode, department, semester, section,
      subjectName, subjectCode, staffName, staffId, classroom,
      day, startTime, endTime, studentsRollNumbers, studentsNames,
      topicToBeCovered, lectureType
    } = req.body;

    // Conflict detection check
    const conflict = await Timetable.findOne({
      day,
      $or: [
        { classroom, startTime },
        { staffId: staffId || req.user.staffId || 'STF101', startTime },
        { semester, section, startTime }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        isConflict: true,
        message: `Conflict Detected: Classroom '${classroom}' or Staff/Class is already scheduled for '${conflict.subjectName}' on ${day} at ${startTime}.`
      });
    }

    const slot = await Timetable.create({
      courseName: courseName || 'B.Tech CSE',
      courseCode: courseCode || 'CSE-UG',
      department: department || req.user.department || 'Computer Science & Engineering',
      semester: semester || 6,
      section: section || 'A',
      subjectName,
      subjectCode,
      staffName: staffName || req.user.name,
      staffId: staffId || req.user.staffId || 'STF101',
      classroom,
      day,
      startTime,
      endTime,
      studentsRollNumbers: studentsRollNumbers || ['21CSE001', '21CSE002', '21CSE045'],
      studentsNames: studentsNames || ['Alex Johnson', 'Beatriz Silva', 'Radha Raman'],
      topicToBeCovered: topicToBeCovered || 'Introduction & Architecture Overview',
      lectureType: lectureType || 'Theory'
    });

    res.status(201).json({ success: true, message: 'Timetable slot created successfully', data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Suggest Best Schedule
// @route   POST /api/timetable/ai-suggest
const aiSuggestSchedule = async (req, res) => {
  try {
    const { day, classroom, startTime, staffId, semester, section } = req.body;
    const result = await recommendOptimalSchedule({ day, classroom, startTime, staffId, semester, section });
    res.json({ success: true, recommendation: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update timetable slot
// @route   PUT /api/timetable/:id
const updateTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable slot not found' });
    }
    res.json({ success: true, message: 'Slot updated successfully', data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete timetable slot
// @route   DELETE /api/timetable/:id
const deleteTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    res.json({ success: true, message: 'Timetable slot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTimetable,
  createTimetableSlot,
  aiSuggestSchedule,
  updateTimetableSlot,
  deleteTimetableSlot
};
