// ==================== Enrollment Routes ==================== //

const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authMiddleware } = require('../middlewares/auth');
const multer = require('multer');

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Protected routes
router.post('/', authMiddleware, upload.single('idProof'), enrollmentController.createEnrollment);
router.get('/my-enrollments', authMiddleware, enrollmentController.getUserEnrollments);
router.get('/:enrollmentId/qr-code', authMiddleware, enrollmentController.getQRCode);
router.get('/event/:eventId', authMiddleware, enrollmentController.getEventEnrollments);
router.patch('/:id/approve', authMiddleware, enrollmentController.approveEnrollment);
router.patch('/:id/reject', authMiddleware, enrollmentController.rejectEnrollment);

// Organizer route to mark attendance for their own events
router.post('/:enrollmentId/organizer-attendance', authMiddleware, enrollmentController.markAttendanceByOrganizer);

module.exports = router;
