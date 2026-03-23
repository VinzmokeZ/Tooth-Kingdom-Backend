const { exec } = require('child_process');

console.log('Starting automated Capacitor sync...');

const sync = exec('npx cap copy android');

// Write 'y' just in case there's a prompt
sync.stdin.write('y\n');

sync.stdout.on('data', (data) => process.stdout.write(data));
sync.stderr.on('data', (data) => process.stderr.write(data));

sync.on('close', (code) => {
  console.log(`Sync process exited with code ${code}`);
  process.exit(code);
});
