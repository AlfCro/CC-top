const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Test case 4: Vue 3 (Vite) + pnpm
 *
 * Detect by: `vue` dep + `pnpm-lock.yaml`
 * Build command: `pnpm build`
 * Output dir: dist/
 * Base URL: base: '/repo-name/' in vite.config.ts
 */

function detect(repoPath) {
  const lockFile = path.join(repoPath, 'pnpm-lock.yaml');
  const pkgFile = path.join(repoPath, 'package.json');

  if (!fs.existsSync(lockFile) || !fs.existsSync(pkgFile)) return false;

  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  return 'vue' in deps && 'vite' in deps;
}

function injectBase(repoPath, repoName) {
  const configFiles = ['vite.config.ts', 'vite.config.js'].map(f =>
    path.join(repoPath, f)
  );
  const configPath = configFiles.find(f => fs.existsSync(f));

  if (!configPath) {
    throw new Error('vite.config.ts / vite.config.js not found');
  }

  let src = fs.readFileSync(configPath, 'utf8');

  // Already has a base option — skip
  if (/\bbase\s*:/.test(src)) {
    console.log('base already set in', path.basename(configPath));
    return;
  }

  // Insert base inside the defineConfig({ ... }) call
  src = src.replace(
    /defineConfig\(\s*\{/,
    `defineConfig({\n  base: '/${repoName}/',`
  );

  fs.writeFileSync(configPath, src);
  console.log(`Injected base: '/${repoName}/' into`, path.basename(configPath));
}

function addNojekyll(distPath) {
  fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
}

function add404Fallback(distPath) {
  const index = path.join(distPath, 'index.html');
  const fallback = path.join(distPath, '404.html');
  if (fs.existsSync(index) && !fs.existsSync(fallback)) {
    fs.copyFileSync(index, fallback);
    console.log('Created 404.html fallback for Vue Router history mode');
  }
}

function build(repoPath, repoName) {
  if (!detect(repoPath)) {
    throw new Error('Repo does not match Vue 3 (Vite) + pnpm pattern');
  }

  injectBase(repoPath, repoName);

  console.log('Running: pnpm build');
  execSync('pnpm build', { cwd: repoPath, stdio: 'inherit' });

  const distPath = path.join(repoPath, 'dist');
  addNojekyll(distPath);
  add404Fallback(distPath);

  return distPath;
}

module.exports = { detect, build };
