// ==================== Admin Routes ==================== //

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const enrollmentController = require('../controllers/enrollmentController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/dashboard-stats', adminController.getDashboardStats);

// Events management
router.get('/events/pending', adminController.getPendingEvents);
router.get('/events/approved', adminController.getApprovedEvents);
router.get('/events', adminController.getAllEvents);
router.patch('/events/:id/approve', adminController.approveEvent);
router.patch('/events/:id/reject', adminController.rejectEvent);
router.delete('/events/:id', adminController.deleteEvent);
router.patch('/events/:id/toggle-enrollment', adminController.toggleEnrollment);

// Users management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId/enrollments', enrollmentController.getUserEnrollmentsAdmin);

// Enrollments management
router.get('/enrollments', enrollmentController.getAllEnrollments);
router.patch('/enrollments/:id/approve', adminController.approveEnrollment);
router.post('/enrollments/:enrollmentId/attendance', enrollmentController.markAttendance);

// Reports
router.get('/reports', adminController.getReports);

module.exports = router;
