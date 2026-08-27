#!/usr/bin/env node
/**
 * Prepare HBMP AgentBot to run as its own app (not under the parent website).
 * Copies example configs if missing. Never overwrites an existing .env.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envExample = path.join(root, '.env.example');
const envFile = path.join(root, '.env');
const yamlExample = path.join(root, 'librechat.yaml.example');
const yamlFile = path.join(root, 'librechat.yaml');

function copyIfMissing(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.error(`Missing ${label} template: ${src}`);
    process.exit(1);
  }
  if (fs.existsSync(dest)) {
    console.log(`✓ ${path.basename(dest)} already exists`);
    return false;
  }
  fs.copyFileSync(src, dest);
  console.log(`✓ Created ${path.basename(dest)} from ${path.basename(src)}`);
  return true;
}

copyIfMissing(envExample, envFile, '.env.example');
copyIfMissing(yamlExample, yamlFile, 'librechat.yaml.example');

const envHasPlaceholders =
  fs.existsSync(envFile) && fs.readFileSync(envFile, 'utf8').includes('replace_with_openssl');

if (envHasPlaceholders) {
  console.log(`
Next:
  1. Edit .env — set GOOGLE_KEY (or another provider key)
  2. Replace SESSION_SECRET / JWT_* / CREDS_* with: openssl rand -hex 32
  3. Set DOMAIN_CLIENT and DOMAIN_SERVER to this app's public URL
  4. Run:  npm run standalone:dev   (local)  or  npm run standalone:prod
`);
} else {
  console.log('\nSetup files are ready. Start with: npm run standalone:dev\n');
}
