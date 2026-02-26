// ==================== Event Routes ==================== //

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middlewares/auth');

// Public routes
router.get('/featured', eventController.getFeaturedEvents);
router.get('/all', eventController.getAllEvents);

// Protected routes
router.post('/', authMiddleware, eventController.createEvent);
router.get('/nearby', authMiddleware, eventController.getNearbyEvents);
router.get('/my-events', authMiddleware, eventController.getUserEvents);
router.get('/:id', authMiddleware, eventController.getEventById);
router.patch('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

module.exports = router;
