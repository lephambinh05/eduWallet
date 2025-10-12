const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Checking for processes on port 3003...');

// First, kill any existing processes on the port
const killProcess = spawn('node', [path.join(__dirname, 'kill-port.js')], {
  stdio: 'inherit'
});

killProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Port cleared, starting backend server...');
    
    // Start the actual backend server
    const serverProcess = spawn('node', ['app-with-api.js'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    serverProcess.on('close', (serverCode) => {
      console.log(`Backend server exited with code ${serverCode}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start backend server:', error);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down backend server...');
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down backend server...');
      serverProcess.kill('SIGTERM');
    });

  } else {
    console.error('❌ Failed to clear port');
    process.exit(1);
  }
});

killProcess.on('error', (error) => {
  console.error('❌ Error running kill script:', error);
  process.exit(1);
});
