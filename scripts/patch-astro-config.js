#!/usr/bin/env node
// Patches astro.config.mjs to inject `site` and `base` for GitHub Pages subpath deploys.
// Reads REPO_OWNER and REPO_NAME from env (set by the workflow).

const fs = require('fs');
const path = require('path');

const owner = process.env.REPO_OWNER;
const repoName = process.env.REPO_NAME;

if (!owner || !repoName) {
  console.error('REPO_OWNER and REPO_NAME must be set');
  process.exit(1);
}

const site = `https://${owner}.github.io`;
const base = `/${repoName}`;
const configPath = path.resolve('astro.config.mjs');

if (!fs.existsSync(configPath)) {
  console.log('No astro.config.mjs found — skipping patch');
  process.exit(0);
}

let config = fs.readFileSync(configPath, 'utf8');

// Inject or replace `site` and `base` inside defineConfig({...})
config = setOption(config, 'site', `'${site}'`);
config = setOption(config, 'base', `'${base}'`);

fs.writeFileSync(configPath, config);
console.log(`Patched astro.config.mjs: site=${site}, base=${base}`);

// ── helpers ────────────────────────────────────────────────────────────────

function setOption(src, key, value) {
  const existing = new RegExp(`(\\b${key}\\s*:)[^,}\\n]+`);
  if (existing.test(src)) {
    return src.replace(existing, `$1 ${value}`);
  }
  // Insert after the opening brace of defineConfig({
  return src.replace(/(defineConfig\s*\(\s*\{)/, `$1\n  ${key}: ${value},`);
}
