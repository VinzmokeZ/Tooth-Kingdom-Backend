const { spawn, execSync } = require('child_process');
const path = require('path');

// CONFIG
const PORT = 8010;
const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'backend', 'python');

console.log('============================================================');
console.log('   TOOTH KINGDOM - UNIFIED ANDROID STUDIO LOGS (v4.0.8)');
console.log('   [One tab. All logs. Perfect for IDEs]');
console.log('============================================================\n');

const log = (name, color, msg) => {
    const time = new Date().toLocaleTimeString();
    console.log(`\x1b[90m[${time}]\x1b[0m \x1b[1m${color}[${name}]\x1b[0m ${msg.trim()}`);
};

const run = (name, color, command, args, cwd) => {
    // FORCE UTF-8 encoding for Python to prevent 'charmap' errors
    const env = { ...process.env, PYTHONIOENCODING: 'utf-8' };
    const proc = spawn(command, args, { cwd, shell: true, env });
    
    proc.stdout.on('data', (data) => data.toString().split('\n').filter(l => l.trim()).forEach(l => log(name, color, l)));
    proc.stderr.on('data', (data) => data.toString().split('\n').filter(l => l.trim()).forEach(l => {
        // Filter out noisy debug messages if needed
        console.error(`\x1b[31;1m[${name} ERROR]\x1b[0m ${l.trim()}`);
    }));
    return proc;
};

// 0. NATIVE KILL GHOSTS
console.log('[SYSTEM] Hunting for ghost servers on port 8010...');
try {
    const result = execSync(`netstat -aon | findstr :${PORT}`).toString();
    const pid = result.split(' ').filter(s => s.trim()).pop();
    if (pid && !isNaN(pid)) {
        console.log(`[SYSTEM] Found ghost PID ${pid.trim()}. Terminating...`);
        execSync(`taskkill /F /PID ${pid.trim()}`);
    }
} catch (e) {
    // No process found
}

// 1. ADB REVERSE
console.log('[SYSTEM] Activating USB Bridge...');
const adbPath = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
spawn(`"${adbPath}"`, ['reverse', `tcp:${PORT}`, `tcp:${PORT}`], { shell: true }).on('exit', () => {
    console.log('[SYSTEM] USB Bridge: Active ✅\n');

    // 2. BACKEND (Purple)
    run('BACKEND', '\x1b[35m', 'python', ['-u', 'main.py'], BACKEND_DIR);

    // 3. DB VIEWER (Cyan)
    run('LIVE_DB', '\x1b[36m', 'python', ['-u', 'db_viewer_v3.py'], BACKEND_DIR);
});

process.on('SIGINT', () => {
    console.log('\n[SYSTEM] Shutting down all engines...');
    process.exit();
});
