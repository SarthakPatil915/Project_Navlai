// ==================== Enrollment Controller ==================== //

const QRCode = require('qrcode');
const axios = require('axios');
const { Enrollment, Event, User } = require('../models');

// Brevo API Configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = 'Navlai';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@navlai.com';

// Generate QR Code data URL
const generateQRCode = async (data) => {
    try {
        return await QRCode.toDataURL(JSON.stringify(data), {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 256,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        return null;
    }
};

// Send QR Code email
const sendQRCodeEmail = async (userEmail, userName, eventTitle, eventDate, eventTime, eventLocation, qrCode, enrollmentId) => {
    if (!BREVO_API_KEY) {
        console.log('BREVO_API_KEY not configured, skipping email');
        return false;
    }

    try {
        // Extract base64 content from data URL
        const base64Content = qrCode.split(',')[1];
        const contentId = `qrcode-${enrollmentId}`;
        
        const emailPayload = {
            to: [{ email: userEmail, name: userName }],
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            subject: `Enrollment Confirmed - ${eventTitle}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                    <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
                        <h1 style="color: #333; margin: 0;">Navlai</h1>
                    </div>
                    
                    <h2 style="color: #22c55e; text-align: center; margin-top: 30px;">✓ Enrollment Confirmed!</h2>
                    <p style="text-align: center; color: #666;">Hi ${userName}, your registration is complete.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
                        <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">📅 Event Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; color: #666;">Event:</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${eventTitle}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; color: #333;">${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; color: #333;">${eventTime}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666;">Location:</td><td style="padding: 8px 0; color: #333;">${eventLocation}</td></tr>
                        </table>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; color: white;">
                        <h3 style="margin: 0 0 15px 0;">🎫 Your Entry Pass</h3>
                        <div style="background-color: white; padding: 20px; border-radius: 8px; display: inline-block;">
                            <img src="cid:${contentId}" alt="QR Code" width="180" height="180" style="display: block;"/>
                        </div>
                        <p style="margin: 15px 0 5px 0; font-size: 14px;">Show this QR code at the event gate</p>
                    </div>
                    
                    <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #fcd34d;">
                        <h3 style="margin: 0 0 10px 0; color: #92400e;">📝 Manual Entry Code</h3>
                        <p style="color: #78350f; margin: 0 0 10px 0;">If QR code doesn't work or can't be scanned, provide this code:</p>
                        <div style="background-color: #fff; padding: 15px; border-radius: 8px; text-align: center; border: 2px dashed #f59e0b;">
                            <code style="font-size: 18px; font-weight: bold; color: #92400e; letter-spacing: 2px;">${enrollmentId}</code>
                        </div>
                        <p style="color: #78350f; font-size: 12px; margin: 10px 0 0 0;">Keep this code safe. You'll need it for entry verification.</p>
                    </div>
                    
                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Thank you for registering with Navlai.<br/>
                            See you at the event! 🎉
                        </p>
                    </div>
                </div>
            `,
            attachment: [{
                content: base64Content,
                name: `qr-code-${enrollmentId}.png`,
                contentId: contentId,
                isInline: true
            }],
            messageVersions: [{
                to: [{ email: userEmail, name: userName }],
                params: {},
                headers: {
                    'X-Entity-Ref-ID': enrollmentId
                }
            }]
        };

        // (contentId and isInline are now set in the attachment above)

        await axios.post(BREVO_API_URL, emailPayload, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log(`QR code email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending QR code email:', error.response?.data || error.message);
        return false;
    }
};

// Create Enrollment
const createEnrollment = async (req, res) => {
    try {
        const { eventId, name, age, location, contact } = req.body;
        const userId = req.userId;
        
        // Validate eventId
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }
        
        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Check event status
        if (event.status !== 'approved') {
            return res.status(400).json({ message: 'Event is not approved for enrollment' });
        }
        
        // Check if enrollment is closed
        if (event.enrollmentClosed) {
            return res.status(400).json({ message: 'Enrollment is closed for this event' });
        }
        
        // Check if max seats reached
        if (event.enrollments && event.enrollments.length >= event.maxSeats) {
            return res.status(400).json({ message: 'No seats available' });
        }
        
        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ eventId, userId });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled for this event' });
        }
        
        // Handle file upload
        let idProofPath = req.file ? req.file.path : '';
        
        if (!idProofPath) {
            return res.status(400).json({ message: 'ID proof is required' });
        }

        const enrollment = await Enrollment.create({
            eventId,
            userId,
            name,
            age: parseInt(age),
            location,
            contact,
            idProof: idProofPath,
            status: 'confirmed'
        });

        // Generate QR code for enrollment
        const qrData = {
            enrollmentId: enrollment._id.toString(),
            eventId: eventId,
            userId: userId,
            timestamp: Date.now()
        };
        
        const qrCode = await generateQRCode(qrData);
        if (qrCode) {
            enrollment.qrCode = qrCode;
            await enrollment.save();
            
            // Send QR code email to user
            const user = await User.findById(userId);
            if (user && user.email) {
                const eventLocation = event.location?.address || event.area || 'TBA';
                await sendQRCodeEmail(
                    user.email,
                    user.name,
                    event.title,
                    event.date,
                    event.time,
                    eventLocation,
                    qrCode,
                    enrollment._id.toString()
                );
            }
        }
        
        // Add enrollment to event
        if (!event.enrollments) {
            event.enrollments = [];
        }
        event.enrollments.push(enrollment._id);
        await event.save();
        
        res.status(201).json({
            message: 'Enrollment successful',
            enrollment: {
                ...enrollment.toObject(),
                qrCode: qrCode
            }
        });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({ message: 'Failed to create enrollment' });
    }
};

// Get User's Enrollments
const getUserEnrollments = async (req, res) => {
    try {
        const userId = req.userId;
        
        const enrollments = await Enrollment.find({ userId })
            .populate('eventId', 'title date time area district location image');
        
        res.json({ enrollments });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

// Get QR Code for Enrollment
const getQRCode = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const userId = req.userId;
        
        const enrollment = await Enrollment.findOne({ _id: enrollmentId, userId });
        
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        // If QR code already exists, return it
        if (enrollment.qrCode) {
            return res.json({ qrCode: enrollment.qrCode });
        }
        
        // Generate new QR code if not exists
        const qrData = {
            enrollmentId: enrollment._id.toString(),
            eventId: enrollment.eventId.toString(),
            userId: userId,
            timestamp: Date.now()
        };
        
        const qrCode = await generateQRCode(qrData);
        if (qrCode) {
            enrollment.qrCode = qrCode;
            await enrollment.save();
        }
        
        res.json({ qrCode: qrCode || null });
    } catch (error) {
        console.error('Error getting QR code:', error);
        res.status(500).json({ message: 'Failed to get QR code' });
    }
};

// Get Event Enrollments (for admin)
const getEventEnrollments = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const enrollments = await Enrollment.find({ eventId })
            .populate('userId', 'name email mobile');
        
        res.json({ enrollments });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

// Approve Enrollment (admin only)
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

// Reject Enrollment (admin only)
const rejectEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const enrollment = await Enrollment.findByIdAndUpdate(
            id,
            { status: 'rejected' },
            { new: true }
        );
        
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        res.json({ message: 'Enrollment rejected', enrollment });
    } catch (error) {
        console.error('Error rejecting enrollment:', error);
        res.status(500).json({ message: 'Failed to reject enrollment' });
    }
};

// Mark Attendance (admin only)
const markAttendance = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        
        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('userId', 'name email')
            .populate('eventId', 'title');
        
        if (!enrollment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Enrollment not found' 
            });
        }
        
        if (enrollment.attended) {
            return res.status(400).json({ 
                success: false, 
                message: 'Attendance already marked for this enrollment' 
            });
        }
        
        enrollment.attended = true;
        enrollment.attendedAt = new Date();
        await enrollment.save();
        
        res.json({
            success: true,
            message: 'Attendance marked successfully',
            enrollment
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to mark attendance' 
        });
    }
};

// Get All Enrollments (admin only)
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('userId', 'name email mobile')
            .populate('eventId', 'title date time area district')
            .sort({ createdAt: -1 });
        
        res.json({ enrollments });
    } catch (error) {
        console.error('Error fetching all enrollments:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

// Get User's Enrollments by Admin
const getUserEnrollmentsAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const enrollments = await Enrollment.find({ userId })
            .populate('eventId', 'title date time area district')
            .sort({ createdAt: -1 });
        
        res.json({ enrollments });
    } catch (error) {
        console.error('Error fetching user enrollments:', error);
        res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
};

// Mark Attendance by Event Organizer (for their own events)
const markAttendanceByOrganizer = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const organizerId = req.userId;
        
        // Find the enrollment
        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('userId', 'name email')
            .populate('eventId', 'title createdBy');
        
        if (!enrollment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Enrollment not found' 
            });
        }
        
        // Check if the current user is the event organizer
        if (enrollment.eventId.createdBy.toString() !== organizerId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only mark attendance for your own events' 
            });
        }
        
        if (enrollment.attended) {
            return res.status(400).json({ 
                success: false, 
                message: 'Attendance already marked for this enrollment',
                enrollment: {
                    userName: enrollment.userId?.name,
                    userEmail: enrollment.userId?.email,
                    eventTitle: enrollment.eventId?.title,
                    attendedAt: enrollment.attendedAt
                }
            });
        }
        
        enrollment.attended = true;
        enrollment.attendedAt = new Date();
        await enrollment.save();
        
        res.json({
            success: true,
            message: 'Attendance marked successfully',
            enrollment: {
                _id: enrollment._id,
                userName: enrollment.userId?.name,
                userEmail: enrollment.userId?.email,
                eventTitle: enrollment.eventId?.title,
                attended: enrollment.attended,
                attendedAt: enrollment.attendedAt
            }
        });
    } catch (error) {
        console.error('Error marking attendance by organizer:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to mark attendance' 
        });
    }
};

module.exports = {
    createEnrollment,
    getUserEnrollments,
    getQRCode,
    getEventEnrollments,
    approveEnrollment,
    rejectEnrollment,
    markAttendance,
    markAttendanceByOrganizer,
    getAllEnrollments,
    getUserEnrollmentsAdmin
};
