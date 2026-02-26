// ==================== Feedback Controller ==================== //

const { Feedback } = require('../models');
const axios = require('axios');
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'navlai.org@gmail.com';
const SENDER_NAME = 'Navlai';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@navlai.com';

// Create feedback/contact message
exports.createFeedback = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            name,
            email,
            phone: phone || '',
            subject,
            message
        });

        // Send email to admin
        if (BREVO_API_KEY && ADMIN_EMAIL) {
            try {
                await axios.post(BREVO_API_URL, {
                    to: [{ email: ADMIN_EMAIL, name: 'Admin' }],
                    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                    subject: `New Contact/Feedback: ${subject}`,
                    htmlContent: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                            <h2 style="color: #2563eb;">New Contact/Feedback Message</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone || '-'} </p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">${message.replace(/\n/g, '<br/>')}</div>
                            <p style="margin-top: 24px; color: #888; font-size: 12px;">This message was sent from the Navlai Contact Us form.</p>
                        </div>
                    `
                }, {
                    headers: {
                        'api-key': BREVO_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err) {
                console.error('Failed to send feedback email to admin:', err?.response?.data || err.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Feedback received successfully',
            feedback
        });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback',
            error: error.message
        });
    }
};

// Get all feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .sort({ createdAt: -1 })
            .limit(100);

        const stats = {
            total: feedback.length,
            new: feedback.filter(f => f.status === 'new').length,
            read: feedback.filter(f => f.status === 'read').length,
            responded: feedback.filter(f => f.status === 'responded').length
        };

        res.json({
            success: true,
            feedback,
            stats
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback',
            error: error.message
        });
    }
};

// Get feedback by ID (Admin only)
exports.getFeedbackById = async (req, res) => {
    try {
        const { feedbackId } = req.params;

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Mark as read
        if (feedback.status === 'new') {
            feedback.status = 'read';
            await feedback.save();
        }

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback',
            error: error.message
        });
    }
};

// Update feedback status (Admin only)
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { status } = req.body;

        if (!['new', 'read', 'responded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: 'Feedback status updated',
            feedback
        });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating feedback',
            error: error.message
        });
    }
};

// Delete feedback (Admin only)
exports.deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;

        const feedback = await Feedback.findByIdAndDelete(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting feedback',
            error: error.message
        });
    }
};
