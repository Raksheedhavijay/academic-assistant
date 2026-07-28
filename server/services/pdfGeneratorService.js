const PDFDocument = require('pdfkit');

const generateHallTicketPDF = (hallTicketData, res) => {
  const doc = new PDFDocument({ margin: 40 });

  // Stream output directly to express response
  doc.pipe(res);

  // Header Banner
  doc.rect(40, 40, 532, 60).fill('#2563EB');
  doc.fillColor('#FFFFFF')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text('ACADEMIC ASSISTANT UNIVERSITY', 50, 52, { align: 'center' });
  doc.fontSize(12)
     .font('Helvetica')
     .text('OFFICIAL EXAMINATION HALL TICKET', 50, 78, { align: 'center' });

  doc.moveDown(3);
  doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('Candidate Details', 50, 120);

  doc.rect(40, 138, 532, 100).fillAndStroke('#F8FAFC', '#CBD5E1');
  doc.fillColor('#0F172A').fontSize(10).font('Helvetica');

  doc.text(`Student Name: ${hallTicketData.studentName}`, 55, 150);
  doc.text(`Roll Number: ${hallTicketData.rollNumber}`, 55, 170);
  doc.text(`Department: ${hallTicketData.department || 'Computer Science & Engg'}`, 55, 190);
  doc.text(`Semester: ${hallTicketData.semester || 6} (Section A)`, 55, 210);

  doc.text(`Exam Name: ${hallTicketData.examName}`, 320, 150);
  doc.text(`Hall Number: ${hallTicketData.hallNumber}`, 320, 170);
  doc.text(`Seat Number: ${hallTicketData.seatNumber}`, 320, 190);
  doc.text(`Exam Block: ${hallTicketData.examBlock || 'Block 1'}`, 320, 210);

  // Exam Schedule Table
  doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('Subject & Schedule', 50, 265);

  doc.rect(40, 285, 532, 26).fill('#1E293B');
  doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
  doc.text('Subject Code', 50, 293);
  doc.text('Subject Name', 160, 293);
  doc.text('Date', 340, 293);
  doc.text('Time', 450, 293);

  doc.rect(40, 311, 532, 35).stroke('#CBD5E1');
  doc.fillColor('#0F172A').fontSize(10).font('Helvetica');
  doc.text(hallTicketData.subjectCode || 'CS601', 50, 323);
  doc.text(hallTicketData.subject || 'Advanced Artificial Intelligence', 160, 323);
  doc.text(hallTicketData.examDate || '2026-08-15', 340, 323);
  doc.text(hallTicketData.examTime || '10:00 AM - 01:00 PM', 450, 323);

  // Instructions & Verification Stamp
  doc.moveDown(6);
  doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text('Instructions for Candidate:', 50, 370);
  doc.fontSize(9).font('Helvetica')
     .text('1. Candidate must carry this Hall Ticket along with College ID card to the Exam Hall.', 50, 388)
     .text('2. Arrive 15 minutes prior to the scheduled exam commencement time.', 50, 403)
     .text('3. Electronic gadgets including smartwatches and mobile phones are strictly prohibited.', 50, 418);

  // Signatures
  doc.text('_______________________', 60, 480);
  doc.text('Student Signature', 80, 495);

  doc.text('_______________________', 380, 480);
  doc.text('Controller of Examinations', 390, 495);

  doc.end();
};

module.exports = { generateHallTicketPDF };
