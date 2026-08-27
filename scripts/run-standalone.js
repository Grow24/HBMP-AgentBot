#!/usr/bin/env node
/**
 * Run HBMP AgentBot as a separate app on its own origin (base path /).
 *
 *   node scripts/run-standalone.js --dev    backend :3080 + vite :3090
 *   node scripts/run-standalone.js --prod   build if needed, then backend serves client/dist
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
process.chdir(root);

const mode = process.argv.includes('--prod') ? 'prod' : 'dev';
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const useShell = process.platform === 'win32';

function runSetup() {
  const setup = spawnSync(process.execPath, [path.join('scripts', 'standalone-setup.js')], {
    stdio: 'inherit',
    cwd: root,
  });
  if (setup.status !== 0) {
    process.exit(setup.status || 1);
  }
}

runSetup();

if (!fs.existsSync(path.join(root, 'node_modules'))) {
  console.log('node_modules missing — running npm install (first time can take several minutes)...');
  const install = spawnSync(npmCmd, ['install'], {
    cwd: root,
    stdio: 'inherit',
    shell: useShell,
  });
  if (install.status !== 0) {
    process.exit(install.status || 1);
  }
}

const envPath = path.join(root, '.env');
if (fs.existsSync(envPath) && fs.readFileSync(envPath, 'utf8').includes('replace_with_openssl')) {
  console.warn(
    '\nWarning: .env still has placeholder secrets. Replace them before production use.\n',
  );
}

const host = process.env.HOST || '0.0.0.0';
const apiPort = process.env.PORT || '3080';
const frontendPort = process.env.FRONTEND_PORT || '3090';

if (mode === 'prod') {
  const distIndex = path.join(root, 'client', 'dist', 'index.html');
  if (!fs.existsSync(distIndex)) {
    console.log(
      'client/dist not found — building production bundle (this can take several minutes)...',
    );
    const build = spawnSync(npmCmd, ['run', 'build:production'], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=8192',
        AGENTBOT_BASE: process.env.AGENTBOT_BASE || '/',
        HOST: host,
      },
      shell: useShell,
    });
    if (build.status !== 0) {
      process.exit(build.status || 1);
    }
  }

  console.log(
    `\nStarting HBMP AgentBot (standalone) at http://${host === '0.0.0.0' ? 'localhost' : host}:${apiPort}\n`,
  );
  const backend = spawn(npmCmd, ['run', 'backend'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
      HOST: host,
      PORT: apiPort,
      AGENTBOT_BASE: process.env.AGENTBOT_BASE || '/',
    },
    shell: useShell,
  });
  backend.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code || 0);
    }
  });
} else {
  const children = [];

  function shutdown(signal) {
    for (const child of children) {
      if (child && !child.killed) {
        child.kill(signal);
      }
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  console.log(`
HBMP AgentBot standalone (dev)
  API:      http://localhost:${apiPort}
  Frontend: http://localhost:${frontendPort}
  Base:     /
`);

  const backend = spawn(npmCmd, ['run', 'backend:dev'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      HOST: host,
      PORT: apiPort,
      AGENTBOT_BASE: '/',
    },
    shell: useShell,
  });
  children.push(backend);

  const frontend = spawn(npmCmd, ['run', 'frontend:dev'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      HOST: host,
      PORT: frontendPort,
      BACKEND_PORT: apiPort,
      AGENTBOT_BASE: '/',
    },
    shell: useShell,
  });
  children.push(frontend);

  const exitIfDied = (name) => (code, signal) => {
    if (signal) {
      shutdown(signal);
      return;
    }
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown('SIGTERM');
      process.exit(code);
    }
  };

  backend.on('exit', exitIfDied('backend'));
  frontend.on('exit', exitIfDied('frontend'));
}
