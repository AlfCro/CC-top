'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { detectBuildConfig } = require('./detect');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'detect-test-'));
}

function writeFile(dir, name, content = '') {
  fs.writeFileSync(path.join(dir, name), content);
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

// ── Test case 12: Hugo + npm scripts ────────────────────────────────────────
console.log('\nCase 12 — Hugo + npm scripts');
{
  const dir = makeTempDir();
  writeFile(dir, 'hugo.toml', 'baseURL = "https://user.github.io/repo-name/"');
  writeFile(dir, 'package.json', JSON.stringify({
    scripts: { build: 'hugo --minify' },
    devDependencies: {},
  }));
  writeFile(dir, 'package-lock.json');

  const cfg = detectBuildConfig(dir);
  assert('detected as hugo',           cfg?.type === 'hugo');
  assert('case number is 12',          cfg?.case === 12);
  assert('build command uses npm',     cfg?.buildCommand === 'npm run build');
  assert('output dir is public',       cfg?.outputDir === 'public');
  assert('config file is hugo.toml',   cfg?.configFile === 'hugo.toml');
  assert('package manager is npm',     cfg?.packageManager === 'npm');
  cleanup(dir);
}

// Hugo with config.toml and no package.json (bare hugo)
console.log('\nCase 12 — Hugo without npm (bare hugo binary)');
{
  const dir = makeTempDir();
  writeFile(dir, 'config.toml', 'baseURL = "https://user.github.io/repo-name/"');

  const cfg = detectBuildConfig(dir);
  assert('detected as hugo',           cfg?.type === 'hugo');
  assert('build command is hugo --minify', cfg?.buildCommand === 'hugo --minify');
  assert('output dir is public',       cfg?.outputDir === 'public');
  assert('no packageManager',          cfg?.packageManager === null);
  cleanup(dir);
}

// ── Sanity checks for other cases ────────────────────────────────────────────
console.log('\nCase 1 — Plain Static');
{
  const dir = makeTempDir();
  writeFile(dir, 'index.html', '<h1>Hello</h1>');

  const cfg = detectBuildConfig(dir);
  assert('detected as static',         cfg?.type === 'static');
  assert('no build command',           cfg?.buildCommand === null);
  cleanup(dir);
}

console.log('\nCase 10 — Jekyll');
{
  const dir = makeTempDir();
  writeFile(dir, '_config.yml', 'baseurl: /repo-name');

  const cfg = detectBuildConfig(dir);
  assert('detected as jekyll',         cfg?.type === 'jekyll');
  assert('no build command',           cfg?.buildCommand === null);
  cleanup(dir);
}

console.log('\nCase 2 — React CRA');
{
  const dir = makeTempDir();
  writeFile(dir, 'package.json', JSON.stringify({
    scripts: { build: 'react-scripts build' },
    dependencies: { 'react-scripts': '^5.0.0' },
  }));
  writeFile(dir, 'package-lock.json');

  const cfg = detectBuildConfig(dir);
  assert('detected as react-cra',      cfg?.type === 'react-cra');
  assert('output dir is build',        cfg?.outputDir === 'build');
  cleanup(dir);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
