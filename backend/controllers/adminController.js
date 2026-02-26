// ==================== Admin Controller ==================== //

const { Event, User, Enrollment, Admin } = require('../models');

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const pendingEvents = await Event.countDocuments({ status: 'pending' });
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalEnrollments = await Enrollment.countDocuments();
        
        res.json({
            totalEvents,
            pendingEvents,
            totalUsers,
            totalEnrollments
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// Get Pending Events
const getPendingEvents = async (req, res) => {
    try {
        console.log("Getting pending events ");
        const events = await Event.find({ status: 'pending' })
            .populate('createdBy', 'name email mobile district taluka area')
            .populate('enrollments')
            .sort({ createdAt: -1 });
        
        // Map events to include additional useful data
        const enrichedEvents = events.map(event => ({
            _id: event._id,
            title: event.title,
            type: event.type,
            description: event.description,
            createdBy: event.createdBy,
            location: event.location,
            area: event.area,
            district: event.district,
            taluka: event.taluka,
            date: event.date,
            time: event.time,
            contact: event.contact,
            maxSeats: event.maxSeats,
            enrollmentCount: (event.enrollments || []).length,
            status: event.status,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        }));
        
        res.json({ 
            total: enrichedEvents.length,
            events: enrichedEvents 
        });
    } catch (error) {
        console.error('Error fetching pending events:', error);
        res.status(500).json({ message: 'Failed to fetch pending events' });
    }
};

// Get Approved Events
const getApprovedEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'approved' })
            .populate('enrollments');
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching approved events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Get All Events (Admin View)
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'name email');
        
        res.json({ events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// Approve Event
const approveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        
        const event = await Event.findByIdAndUpdate(
            id,
            {
                status: 'approved',
                adminComment: comment || ''
            },
            { new: true }
        );
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event approved', event });
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({ message: 'Failed to approve event' });
    }
};

// Reject Event
const rejectEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        
        const event = await Event.findByIdAndUpdate(
            id,
            {
                status: 'rejected',
                adminComment: comment || ''
            },
            { new: true }
        );
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event rejected', event });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ message: 'Failed to reject event' });
    }
};

// Toggle Enrollment Status
const toggleEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        event.enrollmentClosed = !event.enrollmentClosed;
        await event.save();
        
        res.json({
            message: event.enrollmentClosed ? 'Enrollment closed' : 'Enrollment opened',
            event
        });
    } catch (error) {
        console.error('Error toggling enrollment:', error);
        res.status(500).json({ message: 'Failed to toggle enrollment' });
    }
};

// Delete Event (Admin)
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Event.findByIdAndDelete(id);
        
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Get All Enrollments
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('eventId', 'title')
            .populate('userId', 'name email');
        
        res.json({ enrollments });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

// Approve Enrollment (Admin)
const approveEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const enrollment = await Enrollment.findByIdAndUpdate(
            id,
            { status: 'approved' },
            { new: true }
        );
        
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        res.json({ message: 'Enrollment approved', enrollment });
    } catch (error) {
        console.error('Error approving enrollment:', error);
        res.status(500).json({ message: 'Failed to approve enrollment' });
    }
};

// Get Reports
const getReports = async (req, res) => {
    try {
        // Events by type
        const eventsByType = await Event.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        
        // Top events by enrollments
        const topEvents = await Event.find({ status: 'approved' })
            .populate('enrollments')
            .sort({ enrollments: -1 })
            .limit(5);
        
        // Enrollment trends
        const enrollmentTrends = await Enrollment.aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrollmentDate' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        res.json({
            eventsByType: Object.fromEntries(eventsByType.map(e => [e._id, e.count])),
            topEvents,
            enrollmentTrends
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
};

module.exports = {
    getDashboardStats,
    getPendingEvents,
    getApprovedEvents,
    getAllEvents,
    approveEvent,
    rejectEvent,
    toggleEnrollment,
    deleteEvent,
    getAllUsers,
    getAllEnrollments,
    approveEnrollment,
    getReports
};
