const { spawn } = require('child_process');
const killPort = require('./kill-port');

console.log('🚀 Starting Face Verification Microservice...\n');

// First, kill any existing processes on our ports
console.log('🔄 Cleaning up existing processes...');
killPort(3000);
killPort(3001);

// Wait a moment for ports to be freed
setTimeout(() => {
  console.log('\n📡 Starting server...');
  
  // Start the server
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  server.on('close', (code) => {
    if (code !== 0) {
      console.log(`❌ Server process exited with code ${code}`);
    }
  });

}, 2000);