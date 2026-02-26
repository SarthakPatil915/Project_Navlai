// ==================== Express Server Setup ==================== //

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Import models and bcrypt for admin initialization
const { User } = require('./models');
const bcrypt = require('bcryptjs');

// Initialize Express
const app = express();

// ==================== Middleware ==================== //

// CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL
    ,
    credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== MongoDB Connection ==================== //

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/navlai';

mongoose.connect(MONGODB_URI)
.then(async () => {
    console.log('✅ MongoDB connected successfully to navlai database');
    
    // Auto-create admin from .env credentials (only if no admin exists)
    await initializeAdminFromEnv();
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Function to initialize admin from .env credentials
async function initializeAdminFromEnv() {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('✅ Admin already exists:', existingAdmin.email);
            return;
        }
        
        // Get admin credentials from .env
        const adminName = process.env.ADMIN_NAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminMobile = process.env.ADMIN_MOBILE;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminName || !adminEmail || !adminMobile || !adminPassword) {
            console.log('⚠️  Admin credentials not found in .env file. Skipping admin creation.');
            return;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        // Create admin
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            mobile: adminMobile,
            password: hashedPassword,
            country: 'India',
            state: 'Maharashtra',
            district: 'Pune',
            taluka: 'Pune',
            area: 'Admin Area',
            role: 'admin',
            emailVerified: true,
            mobileVerified: true
        });
        
        console.log('✅ Admin account created successfully:', admin.email);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    }
}

// ==================== API Routes ==================== //

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

// ==================== Health Check ==================== //

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// SPA fallback - serve index.html for non-file, non-API routes
app.get('*', (req, res) => {
    // Skip API routes and file requests
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
        res.status(404).json({ message: 'Not Found' });
    } else {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// ==================== Error Handling ==================== //

app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        message: error.message || 'Internal Server Error'
    });
});

// ==================== Server Start ==================== //

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
});
