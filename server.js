// server.js
const app = require('./app');
const faceModel = require('./models/modelLoader');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting Enhanced Face Verification Microservice...\n');

    // Load face recognition model (only dependency)
    await faceModel.loadModel();
    console.log('✅ AI Model loaded successfully');

    // Start server
    app.listen(PORT, () => {
      console.log('\n✅ Server started successfully!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   POST http://localhost:${PORT}/encode - Encode face image`);
      console.log(`   POST http://localhost:${PORT}/compare - Compare faces`);
      console.log('\n🐳 Running in Docker: Standalone mode - No database required');
    });
  } catch (error) {
    console.error('\n❌ Unable to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server termination signal received...');
  process.exit(0);
});

startServer();