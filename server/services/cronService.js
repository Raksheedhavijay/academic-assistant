const cron = require('node-cron');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const User = require('../models/User');

const initCronJobs = (io) => {
  console.log('⚡ Initializing Node-Cron Background Service...');

  // Every morning at 8:00 AM - Daily Class & Attendance Check
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('Running daily notification cron job...');
      // Broadcast daily academic reminder
      const notif = await Notification.create({
        targetRole: 'all',
        title: '☀️ Good Morning! Check Today\'s Schedule',
        message: 'Review your classes, upcoming assignment deadlines, and study targets for today.',
        type: 'Class',
        link: '/dashboard'
      });

      if (io) {
        io.emit('new-notification', notif);
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });

  // Every 6 hours - Check Attendance Shortages (< 75%) and create alerts
  cron.schedule('0 */6 * * *', async () => {
    try {
      const students = await User.find({ role: 'student' });
      for (const student of students) {
        const records = await Attendance.find({ rollNumber: student.rollNumber });
        if (records.length > 0) {
          const present = records.filter(r => r.attendanceStatus === 'Present' || r.attendanceStatus === 'Late').length;
          const pct = (present / records.length) * 100;

          if (pct < 75) {
            const existingNotif = await Notification.findOne({
              user: student._id,
              type: 'Attendance',
              read: false
            });

            if (!existingNotif) {
              const alertNotif = await Notification.create({
                user: student._id,
                targetRole: 'student',
                title: '⚠️ Attendance Warning Alert',
                message: `Your current attendance is ${pct.toFixed(1)}%, which is below the mandatory 75% threshold!`,
                type: 'Attendance',
                link: '/attendance'
              });

              if (io) {
                io.to(student._id.toString()).emit('new-notification', alertNotif);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Attendance cron error:', err.message);
    }
  });
};

module.exports = { initCronJobs };
