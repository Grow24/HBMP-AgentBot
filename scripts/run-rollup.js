const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findRollup(startDir) {
  let dir = startDir;
  for (;;) {
    const candidate = path.join(dir, 'node_modules', 'rollup', 'dist', 'bin', 'rollup');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

const pkgDir = process.cwd();
const rollup = findRollup(pkgDir);
if (!rollup) {
  console.error('rollup CLI not found walking up from', pkgDir);
  process.exit(127);
}

fs.rmSync(path.join(pkgDir, 'dist'), { recursive: true, force: true });
const result = spawnSync(process.execPath, [rollup, '-c', '--bundleConfigAsCjs'], {
  cwd: pkgDir,
  stdio: 'inherit',
});
process.exit(result.status === null ? 1 : result.status);
