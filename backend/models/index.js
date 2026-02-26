// ==================== MongoDB Models ==================== //

const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage: {
        type: String
    },
    country: String,
    state: String,
    district: String,
    taluka: String,
    area: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Event Schema
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['tree-plantation', 'workshop', 'awareness-drive', 'cleanup', 'health-camp', 'education', 'other']
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String
    },
    area: String,
    district: String,
    taluka: String,
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    maxSeats: {
        type: Number,
        required: true,
        min: 1
    },
    ticketPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    enrollmentClosed: {
        type: Boolean,
        default: false
    },
    enrollments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    adminComment: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create geospatial index for location-based queries
eventSchema.index({ 'location': '2dsphere' });

// Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 1
    },
    location: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    idProof: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'approved', 'rejected', 'cancelled'],
        default: 'confirmed'
    },
    qrCode: {
        type: String // Base64 encoded QR code data URL
    },
    attended: {
        type: Boolean,
        default: false
    },
    attendedAt: {
        type: Date
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Feedback/Contact Message Schema
const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['event-inquiry', 'partnership', 'feedback', 'bug-report', 'other']
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'responded'],
        default: 'new'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// OTP Verification Schema
const otpSchema = new mongoose.Schema({
    email: String,
    mobile: String,
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'password-reset'],
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto delete after 10 minutes
    }
});

// Admin Schema (extends User)
const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permissions: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export Models
module.exports = {
    User: mongoose.model('User', userSchema),
    Event: mongoose.model('Event', eventSchema),
    Enrollment: mongoose.model('Enrollment', enrollmentSchema),
    Review: mongoose.model('Review', reviewSchema),
    Feedback: mongoose.model('Feedback', feedbackSchema),
    OTPVerification: mongoose.model('OTPVerification', otpSchema),
    Admin: mongoose.model('Admin', adminSchema)
};
