// ==================== Event Controller ==================== //

const { Event, User, Enrollment } = require('../models');

// Create Event
const createEvent = async (req, res) => {
    try {
        const { title, type, description, location, date, time, contact, maxSeats, ticketPrice } = req.body;
        const userId = req.userId;
        
        // Get user data to include area, district, taluka
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Ensure correct GeoJSON order: [lng, lat]
        const lat = location?.lat ?? 0;
        const lng = location?.lng ?? 0;
        const address = location?.address || '';
        const event = await Event.create({
            title,
            type,
            description,
            createdBy: userId,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
                address: address
            },
            area: address || user.area || '',
            district: user.district || '',
            taluka: user.taluka || '',
            date,
            time,
            contact,
            maxSeats,
            ticketPrice: ticketPrice || 0,
            status: 'pending' // Require admin approval
        });
        
        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Failed to create event' });
    }
};

// Get All Events (with filters)
const getAllEvents = async (req, res) => {
    try {
        const { district, taluka, area, status } = req.query;
        const filter = { status: 'approved' };
        
        if (district) filter.district = district;
        if (taluka) filter.taluka = taluka;
        if (area) filter.area = new RegExp(area, 'i');
        
        const events = await Event.find(filter).populate('createdBy', 'name email');
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Get Featured Events
const getFeaturedEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'approved' })
            .limit(6)
            .populate('createdBy', 'name')
            .populate('enrollments');
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching featured events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Get Nearby Events (within radius)
const getNearbyEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        
        // For simplicity, fetch events in same district/state
        const events = await Event.find({
            status: 'approved',
            district: user.district,
            enrollmentClosed: false
        }).populate('enrollments');
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching nearby events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Get Event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email mobile')
            .populate('enrollments', 'name contact');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ event });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
};

// Get User's Events
const getUserEvents = async (req, res) => {
    try {
        const userId = req.userId;
        
        const events = await Event.find({ createdBy: userId })
            .populate('enrollments');
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Update Event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        if (event.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        Object.assign(event, req.body);
        await event.save();
        
        res.json({ message: 'Event updated', event });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Failed to update event' });
    }
};

// Delete Event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        if (event.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await Event.findByIdAndDelete(id);
        
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getFeaturedEvents,
    getNearbyEvents,
    getEventById,
    getUserEvents,
    updateEvent,
    deleteEvent
};
