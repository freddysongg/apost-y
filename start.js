const { spawn } = require('child_process');

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env },
});

const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  stdio: 'inherit',
  env: { ...process.env },
});

process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  vite.kill();
  process.exit(0);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

vite.on('exit', (code) => {
  console.log(`Vite exited with code ${code}`);
});
