const { exec } = require('child_process');

console.log('Final attempt at automated Capacitor sync...');

const sync = exec('npx cap sync android');

// Write multiple 'y's and newlines to satisfy any prompts
sync.stdin.write('y\n');
sync.stdin.write('y\n');
sync.stdin.write('\n');

sync.stdout.on('data', (data) => process.stdout.write(data));
sync.stderr.on('data', (data) => process.stderr.write(data));

sync.on('close', (code) => {
  console.log(`Sync process exited with code ${code}`);
  process.exit(code);
});
