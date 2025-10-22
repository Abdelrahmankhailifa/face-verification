const app = require('./app');
const { sequelize, testConnection } = require('./database/config');
const { syncDatabase } = require('./database/models');
const faceModel = require('./models/modelLoader');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting Face Verification Microservice...\n');

    // Test database connection
    await testConnection();
    
    // Sync database models
    await syncDatabase();
    
    // Load face recognition model
    await faceModel.loadModel();

    // Start server
    app.listen(PORT, () => {
      console.log('\n✅ Server started successfully!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   POST http://localhost:${PORT}/encode - Encode face image`);
      console.log(`   POST http://localhost:${PORT}/compare - Compare faces`);
    });
  } catch (error) {
    console.error('\n❌ Unable to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  if (sequelize) {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server termination signal received...');
  if (sequelize) {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  }
  process.exit(0);
});

startServer();