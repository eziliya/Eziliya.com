import express from 'express';
import mongoose from 'mongoose';
import router from './src/router.mjs';
import { config } from './config.mjs';
import cors from 'cors'

const app = express()

// CORS configuration
app.use(cors())

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// MongoDB connection
mongoose.connect(config.mongoDB).then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Health check for Render / load balancers
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/', router);

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Start server
app.listen(config.port, () => {
    console.log(`\n🚀 Server is running on port ${config.port}`);
    console.log(`📍 API Base URL: http://localhost:${config.port}`);
    console.log(`📝 Registration endpoint: POST http://localhost:${config.port}/register`);
    console.log(`🔐 Login endpoint: POST http://localhost:${config.port}/login\n`);
});
