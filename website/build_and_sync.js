const { exec } = require('child_process');
const { env } = require('process');

console.log('Starting automated build and sync...');

const build = exec('npx vite build --emptyOutDir', {
  env: { ...env, VITE_CJS_IGNORE_WARNING: 'true', CI: 'true' }
});

// Write 'y' just in case there's a prompt
build.stdin.write('y\n');

build.stdout.on('data', (data) => process.stdout.write(data));
build.stderr.on('data', (data) => process.stderr.write(data));

build.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  if (code === 0) {
    console.log('Starting Capacitor sync...');
    const sync = exec('npx cap copy android');
    sync.stdout.on('data', (data) => process.stdout.write(data));
    sync.stderr.on('data', (data) => process.stderr.write(data));
    sync.on('close', (sCode) => {
      console.log(`Sync process exited with code ${sCode}`);
      process.exit(sCode);
    });
  } else {
    process.exit(code);
  }
});
