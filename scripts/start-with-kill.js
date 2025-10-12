const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Checking for processes on port 3000...');

// First, kill any existing processes on the port
const killProcess = spawn('node', [path.join(__dirname, 'kill-port.js')], {
  stdio: 'inherit'
});

killProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Port cleared, starting frontend server...');
    
    // Start the actual frontend server using react-scripts directly
    const serverProcess = spawn('npx', ['react-scripts', 'start'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      shell: true
    });

    serverProcess.on('close', (serverCode) => {
      console.log(`Frontend server exited with code ${serverCode}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start frontend server:', error);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down frontend server...');
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down frontend server...');
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
