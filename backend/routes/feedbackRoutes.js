// ==================== Feedback Routes ==================== //

const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Public route - Create feedback
router.post('/', feedbackController.createFeedback);

// Admin routes - Get all feedback
router.get('/', authMiddleware, adminMiddleware, feedbackController.getAllFeedback);

// Admin routes - Get specific feedback
router.get('/:feedbackId', authMiddleware, adminMiddleware, feedbackController.getFeedbackById);

// Admin routes - Update feedback status
router.put('/:feedbackId/status', authMiddleware, adminMiddleware, feedbackController.updateFeedbackStatus);

// Admin routes - Delete feedback
router.delete('/:feedbackId', authMiddleware, adminMiddleware, feedbackController.deleteFeedback);

module.exports = router;
