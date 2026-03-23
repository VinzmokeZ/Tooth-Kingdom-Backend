import { exec } from 'child_process';
import { env } from 'process';

console.log('Starting Clean ESM build and sync...');

// Using local vite to avoid global version conflicts
const build = exec('node_modules\\.bin\\vite build --emptyOutDir', {
  env: { ...env, VITE_CJS_IGNORE_WARNING: 'true', CI: 'true' }
});

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
