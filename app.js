const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const encodeRoutes = require('./routes/encode');
const compareRoutes = require('./routes/compare');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/encode', encodeRoutes);
app.use('/compare', compareRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Face Verification Microservice',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Face Verification Microservice API',
    version: '1.0.0',
    endpoints: {
      encode: 'POST /encode - Encode face image to embedding',
      compare: 'POST /compare - Compare face with stored embedding'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

module.exports = app;