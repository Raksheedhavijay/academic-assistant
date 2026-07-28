const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Exam = require('../models/Exam');
const HallTicket = require('../models/HallTicket');
const StudyPlan = require('../models/StudyPlan');
const bcrypt = require('bcryptjs');

const seedDatabase = async (force = false) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !force) {
      console.log('🌱 Database already populated. Ensuring demo users exist...');
    } else {
      console.log('🌱 Seeding fresh multi-student academic database...');
      await User.deleteMany({});
      await Course.deleteMany({});
      await Subject.deleteMany({});
      await Timetable.deleteMany({});
      await Attendance.deleteMany({});
      await Assignment.deleteMany({});
      await AssignmentSubmission.deleteMany({});
      await Exam.deleteMany({});
      await HallTicket.deleteMany({});
      await StudyPlan.deleteMany({});
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // Create Admin
    let admin = await User.findOne({ email: 'admin@academic.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'Dr. Sarah Connor',
        email: 'admin@academic.edu',
        password: passwordHash,
        role: 'admin',
        staffId: 'ADM001',
        department: 'Computer Science & Engineering',
        isVerified: true
      });
    }

    // Create Staff 1 & 2
    let staff1 = await User.findOne({ email: 'staff@academic.edu' });
    if (!staff1) {
      staff1 = await User.create({
        name: 'Prof. Alan Turing',
        email: 'staff@academic.edu',
        password: passwordHash,
        role: 'staff',
        staffId: 'STF101',
        department: 'Computer Science & Engineering',
        isVerified: true
      });
    }

    let staff2 = await User.findOne({ email: 'hopper@academic.edu' });
    if (!staff2) {
      staff2 = await User.create({
        name: 'Dr. Grace Hopper',
        email: 'hopper@academic.edu',
        password: passwordHash,
        role: 'staff',
        staffId: 'STF102',
        department: 'Electronics & Communication',
        isVerified: true
      });
    }

    // Create Student 1: Radha Raman (CSE, Sem 6, Sec A)
    let student1 = await User.findOne({ email: 'student@academic.edu' });
    if (!student1) {
      student1 = await User.create({
        name: 'Radha Raman',
        email: 'student@academic.edu',
        password: passwordHash,
        role: 'student',
        rollNumber: '21CSE045',
        department: 'Computer Science & Engineering',
        semester: 6,
        section: 'A',
        isVerified: true
      });
    }

    // Create Student 2: Beatriz Silva (CSE, Sem 6, Sec B)
    let student2 = await User.findOne({ email: 'beatriz@academic.edu' });
    if (!student2) {
      student2 = await User.create({
        name: 'Beatriz Silva',
        email: 'beatriz@academic.edu',
        password: passwordHash,
        role: 'student',
        rollNumber: '21CSE046',
        department: 'Computer Science & Engineering',
        semester: 6,
        section: 'B',
        isVerified: true
      });
    }

    // Create Student 3: Alex Johnson (ECE, Sem 4, Sec A)
    let student3 = await User.findOne({ email: 'alex@academic.edu' });
    if (!student3) {
      student3 = await User.create({
        name: 'Alex Johnson',
        email: 'alex@academic.edu',
        password: passwordHash,
        role: 'student',
        rollNumber: '21ECE012',
        department: 'Electronics & Communication',
        semester: 4,
        section: 'A',
        isVerified: true
      });
    }

    // Populate Courses & Subjects if empty
    if ((await Course.countDocuments()) === 0) {
      await Course.create([
        { courseName: 'B.Tech Computer Science & Engineering', courseCode: 'BTECH-CSE', department: 'Computer Science & Engineering', durationYears: 4, totalSemesters: 8 },
        { courseName: 'B.Tech Electronics & Communication', courseCode: 'BTECH-ECE', department: 'Electronics & Communication', durationYears: 4, totalSemesters: 8 }
      ]);
    }

    if ((await Subject.countDocuments()) === 0) {
      await Subject.create([
        { subjectName: 'Artificial Intelligence & Machine Learning', subjectCode: 'CS601', department: 'Computer Science & Engineering', semester: 6, credits: 4 },
        { subjectName: 'Database Management Systems', subjectCode: 'CS602', department: 'Computer Science & Engineering', semester: 6, credits: 4 },
        { subjectName: 'Cloud Computing & DevOps', subjectCode: 'CS603', department: 'Computer Science & Engineering', semester: 6, credits: 3 },
        { subjectName: 'Digital Signal Processing', subjectCode: 'EC401', department: 'Electronics & Communication', semester: 4, credits: 4 },
        { subjectName: 'VLSI Circuit Design', subjectCode: 'EC402', department: 'Electronics & Communication', semester: 4, credits: 4 }
      ]);
    }

    // Populate Timetables for different sections & days
    if ((await Timetable.countDocuments()) === 0) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Section A CSE (Radha Raman) Timetable
      for (const day of days) {
        await Timetable.create({
          courseName: 'BTECH-CSE',
          courseCode: 'CSE-UG',
          department: 'Computer Science & Engineering',
          semester: 6,
          section: 'A',
          subjectName: day === 'Monday' || day === 'Wednesday' ? 'Artificial Intelligence & Machine Learning' : 'Database Management Systems',
          subjectCode: day === 'Monday' || day === 'Wednesday' ? 'CS601' : 'CS602',
          staffName: 'Prof. Alan Turing',
          staffId: 'STF101',
          classroom: 'Lab 3 (AI Lab)',
          day,
          startTime: '09:00',
          endTime: '10:30',
          studentsRollNumbers: ['21CSE045'],
          studentsNames: ['Radha Raman'],
          topicToBeCovered: 'Deep Neural Networks & Backpropagation',
          lectureType: 'Theory'
        });

        await Timetable.create({
          courseName: 'BTECH-CSE',
          courseCode: 'CSE-UG',
          department: 'Computer Science & Engineering',
          semester: 6,
          section: 'A',
          subjectName: 'Cloud Computing & DevOps',
          subjectCode: 'CS603',
          staffName: 'Prof. Alan Turing',
          staffId: 'STF101',
          classroom: 'Hall 204',
          day,
          startTime: '11:00',
          endTime: '12:30',
          studentsRollNumbers: ['21CSE045'],
          studentsNames: ['Radha Raman'],
          topicToBeCovered: 'Kubernetes Cluster Architecture',
          lectureType: 'Lab'
        });
      }

      // Section B CSE (Beatriz Silva) Timetable (Different subjects & timings)
      for (const day of days) {
        await Timetable.create({
          courseName: 'BTECH-CSE',
          courseCode: 'CSE-UG',
          department: 'Computer Science & Engineering',
          semester: 6,
          section: 'B',
          subjectName: 'Database Management Systems',
          subjectCode: 'CS602',
          staffName: 'Prof. Alan Turing',
          staffId: 'STF101',
          classroom: 'Hall 105',
          day,
          startTime: '10:00',
          endTime: '11:30',
          studentsRollNumbers: ['21CSE046'],
          studentsNames: ['Beatriz Silva'],
          topicToBeCovered: 'Transaction Control & Concurrency',
          lectureType: 'Theory'
        });

        await Timetable.create({
          courseName: 'BTECH-CSE',
          courseCode: 'CSE-UG',
          department: 'Computer Science & Engineering',
          semester: 6,
          section: 'B',
          subjectName: 'Artificial Intelligence & Machine Learning',
          subjectCode: 'CS601',
          staffName: 'Prof. Alan Turing',
          staffId: 'STF101',
          classroom: 'Lab 2',
          day,
          startTime: '14:00',
          endTime: '15:30',
          studentsRollNumbers: ['21CSE046'],
          studentsNames: ['Beatriz Silva'],
          topicToBeCovered: 'Supervised Learning & SVMs',
          lectureType: 'Practical'
        });
      }

      // ECE Sem 4 (Alex Johnson) Timetable
      for (const day of days) {
        await Timetable.create({
          courseName: 'BTECH-ECE',
          courseCode: 'ECE-UG',
          department: 'Electronics & Communication',
          semester: 4,
          section: 'A',
          subjectName: 'Digital Signal Processing',
          subjectCode: 'EC401',
          staffName: 'Dr. Grace Hopper',
          staffId: 'STF102',
          classroom: 'ECE Lab 1',
          day,
          startTime: '09:30',
          endTime: '11:00',
          studentsRollNumbers: ['21ECE012'],
          studentsNames: ['Alex Johnson'],
          topicToBeCovered: 'Fast Fourier Transforms',
          lectureType: 'Lab'
        });
      }
    }

    // Populate Student-Specific Attendance Records
    if ((await Attendance.countDocuments()) === 0) {
      const today = new Date();

      // Radha Raman (21CSE045) Attendance: 18 total, 16 present (88.9%)
      for (let i = 1; i <= 18; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (d.getDay() === 0) continue; // Skip Sunday (Common Holiday)

        await Attendance.create({
          studentId: student1._id,
          studentName: student1.name,
          rollNumber: student1.rollNumber,
          department: student1.department,
          semester: 6,
          section: 'A',
          subject: i % 2 === 0 ? 'Artificial Intelligence & Machine Learning' : 'Database Management Systems',
          subjectCode: i % 2 === 0 ? 'CS601' : 'CS602',
          date: d.toISOString().split('T')[0],
          hour: 1,
          timing: '09:00 - 10:30',
          attendanceStatus: i === 5 || i === 12 ? 'Absent' : 'Present',
          reasonForAbsence: i === 5 ? 'High Fever' : ''
        });
      }

      // Beatriz Silva (21CSE046) Attendance: 15 total, 9 present (60.0% - SHORTAGE ALERT!)
      for (let i = 1; i <= 15; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (d.getDay() === 0) continue; // Skip Sunday

        await Attendance.create({
          studentId: student2._id,
          studentName: student2.name,
          rollNumber: student2.rollNumber,
          department: student2.department,
          semester: 6,
          section: 'B',
          subject: 'Database Management Systems',
          subjectCode: 'CS602',
          date: d.toISOString().split('T')[0],
          hour: 1,
          timing: '10:00 - 11:30',
          attendanceStatus: i % 2 === 0 ? 'Absent' : 'Present',
          reasonForAbsence: i % 2 === 0 ? 'Personal reasons' : ''
        });
      }

      // Alex Johnson (21ECE012) Attendance: 10 total, 10 present (100.0%)
      for (let i = 1; i <= 10; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (d.getDay() === 0) continue;

        await Attendance.create({
          studentId: student3._id,
          studentName: student3.name,
          rollNumber: student3.rollNumber,
          department: student3.department,
          semester: 4,
          section: 'A',
          subject: 'Digital Signal Processing',
          subjectCode: 'EC401',
          date: d.toISOString().split('T')[0],
          hour: 1,
          timing: '09:30 - 11:00',
          attendanceStatus: 'Present'
        });
      }
    }

    // Populate Student-Specific Assignments & Submissions
    if ((await Assignment.countDocuments()) === 0) {
      const asg1 = await Assignment.create({
        assignmentTitle: 'Neural Network PyTorch Implementation',
        subject: 'Artificial Intelligence & Machine Learning',
        subjectCode: 'CS601',
        staffName: 'Prof. Alan Turing',
        staffId: 'STF101',
        description: 'Build a 3-layer CNN on CIFAR-10 dataset with test accuracy > 85%.',
        marks: 100,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedCompletionTime: '4 hours',
        priority: 'High'
      });

      const asg2 = await Assignment.create({
        assignmentTitle: 'Database Sharding & Query Optimization',
        subject: 'Database Management Systems',
        subjectCode: 'CS602',
        staffName: 'Prof. Alan Turing',
        staffId: 'STF101',
        description: 'Write B-Tree index comparison benchmark for 1 million records.',
        marks: 50,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        estimatedCompletionTime: '2 hours',
        priority: 'Medium'
      });

      const asg3 = await Assignment.create({
        assignmentTitle: 'FFT Signal Analysis Lab Report',
        subject: 'Digital Signal Processing',
        subjectCode: 'EC401',
        staffName: 'Dr. Grace Hopper',
        staffId: 'STF102',
        description: 'Compute discrete Fourier transform on audio signal samples.',
        marks: 100,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        estimatedCompletionTime: '3 hours',
        priority: 'High'
      });

      // Radha Raman submitted Asg 1
      await AssignmentSubmission.create({
        assignment: asg1._id,
        student: student1._id,
        studentName: student1.name,
        rollNumber: student1.rollNumber,
        submissionText: 'https://github.com/radha/pytorch-cnn-cifar10. git. Achieved 88.4% test accuracy.',
        submittedAt: new Date(),
        marksObtained: 95,
        status: 'Graded',
        feedback: 'Excellent CNN implementation and clear documentation.',
        similarityScore: 98
      });

      // Alex Johnson submitted Asg 3
      await AssignmentSubmission.create({
        assignment: asg3._id,
        student: student3._id,
        studentName: student3.name,
        rollNumber: student3.rollNumber,
        submissionText: 'DSP Lab report attached with FFT spectrogram plots.',
        submittedAt: new Date(),
        marksObtained: 90,
        status: 'Graded',
        feedback: 'Great frequency domain plots.',
        similarityScore: 96
      });
    }

    // Populate Exams & Hall Tickets
    if ((await Exam.countDocuments()) === 0) {
      const exam1 = await Exam.create({
        examName: 'Mid-Semester Theory Examination 2026',
        category: 'Internal',
        subject: 'Artificial Intelligence & Machine Learning',
        subjectCode: 'CS601',
        examDate: '2026-08-10',
        examTime: '10:00 AM - 01:00 PM',
        duration: '3 Hours',
        maximumMarks: 100,
        passingMarks: 45,
        examPortion: 'Modules 1 to 3 (Supervised Learning, Loss Functions, CNNs)',
        hallNumber: 'Exam Hall 3B',
        seatNumberPrefix: 'CSE-',
        examBlock: 'Block A',
        invigilator: 'Prof. Alan Turing',
        eligibleStudents: ['21CSE045', '21CSE046']
      });

      const exam2 = await Exam.create({
        examName: 'Digital Signal Processing Practical Exam',
        category: 'Practical',
        subject: 'Digital Signal Processing',
        subjectCode: 'EC401',
        examDate: '2026-08-12',
        examTime: '02:00 PM - 05:00 PM',
        duration: '3 Hours',
        maximumMarks: 100,
        passingMarks: 50,
        examPortion: 'DSP MATLAB / Python Lab Experiments 1-8',
        hallNumber: 'ECE Lab 2',
        seatNumberPrefix: 'ECE-',
        examBlock: 'Block B',
        invigilator: 'Dr. Grace Hopper',
        eligibleStudents: ['21ECE012']
      });

      // Issue Hall Tickets
      await HallTicket.create({
        student: student1._id,
        rollNumber: student1.rollNumber,
        studentName: student1.name,
        department: student1.department,
        semester: 6,
        exam: exam1._id,
        examName: exam1.examName,
        subject: exam1.subject,
        subjectCode: exam1.subjectCode,
        examDate: exam1.examDate,
        examTime: exam1.examTime,
        hallNumber: exam1.hallNumber,
        seatNumber: 'CSE-45',
        examBlock: exam1.examBlock,
        qrCodeData: `HT-${exam1._id}-${student1._id}`,
        isIssued: true
      });

      await HallTicket.create({
        student: student2._id,
        rollNumber: student2.rollNumber,
        studentName: student2.name,
        department: student2.department,
        semester: 6,
        exam: exam1._id,
        examName: exam1.examName,
        subject: exam1.subject,
        subjectCode: exam1.subjectCode,
        examDate: exam1.examDate,
        examTime: exam1.examTime,
        hallNumber: exam1.hallNumber,
        seatNumber: 'CSE-46',
        examBlock: exam1.examBlock,
        qrCodeData: `HT-${exam1._id}-${student2._id}`,
        isIssued: true
      });

      await HallTicket.create({
        student: student3._id,
        rollNumber: student3.rollNumber,
        studentName: student3.name,
        department: student3.department,
        semester: 4,
        exam: exam2._id,
        examName: exam2.examName,
        subject: exam2.subject,
        subjectCode: exam2.subjectCode,
        examDate: exam2.examDate,
        examTime: exam2.examTime,
        hallNumber: exam2.hallNumber,
        seatNumber: 'ECE-12',
        examBlock: exam2.examBlock,
        qrCodeData: `HT-${exam2._id}-${student3._id}`,
        isIssued: true
      });
    }

    // Populate Student Study Plans with valid statuses: ['Pending', 'Finished', 'Need time to study']
    if ((await StudyPlan.countDocuments()) === 0) {
      await StudyPlan.create({
        student: student1._id,
        subject: 'Artificial Intelligence & Machine Learning',
        topic: 'Convolutional & Recurrent Neural Networks',
        notes: 'Review activation functions and gradient clipping.',
        studyTime: '19:00 - 21:00',
        priority: 'High',
        completionStatus: 'Pending',
        estimatedHours: 3,
        actualHours: 1,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        aiRecommendation: 'Practice cross-entropy derivative proofs.'
      });

      await StudyPlan.create({
        student: student1._id,
        subject: 'Database Management Systems',
        topic: 'Index Tuning & B-Tree Optimization',
        notes: 'Benchmark 100k queries.',
        studyTime: '15:00 - 17:00',
        priority: 'Medium',
        completionStatus: 'Finished',
        estimatedHours: 2,
        actualHours: 2,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        aiRecommendation: 'Completed!'
      });

      await StudyPlan.create({
        student: student2._id,
        subject: 'Database Management Systems',
        topic: 'ACID Transactions & Lock Escalation',
        notes: 'Struggling with deadlocks chapter.',
        studyTime: '20:00 - 22:00',
        priority: 'High',
        completionStatus: 'Need time to study',
        estimatedHours: 5,
        actualHours: 1,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        aiRecommendation: 'Allocate 2 additional hours for isolation levels.'
      });
    }

    console.log('✅ Multi-student demo database populated successfully!');
  } catch (error) {
    console.error('Seed Error:', error.message);
  }
};

module.exports = { seedDatabase };
