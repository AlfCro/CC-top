const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Test case 6: Svelte (Vite) + npm / SvelteKit Static Adapter + Bun
 *
 * Plain Svelte (Vite):
 *   - Detect: `svelte` dep, no `@sveltejs/kit`
 *   - Build: `npm run build` → dist/
 *   - Base URL: `base` in vite.config.ts
 *
 * SvelteKit + static adapter + Bun:
 *   - Detect: `@sveltejs/kit` dep, bun.lockb present
 *   - Build: `bun run build` → build/
 *   - Base URL: `paths.base` in svelte.config.js
 */

function detect(repoPath) {
  const pkgPath = path.join(repoPath, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (!deps['svelte']) return null;

  const hasSvelteKit = !!deps['@sveltejs/kit'];
  const hasBunLock = fs.existsSync(path.join(repoPath, 'bun.lockb'));

  if (hasSvelteKit && hasBunLock) return 'sveltekit-bun';
  return 'svelte-npm';
}

function build(repoPath, repoName) {
  const type = detect(repoPath);
  if (!type) throw new Error('Not a Svelte project');

  if (type === 'sveltekit-bun') {
    setSvelteKitBase(repoPath, repoName);
    execSync('bun run build', { cwd: repoPath, stdio: 'inherit' });
    return { outputDir: 'build' };
  } else {
    setViteBase(repoPath, repoName);
    execSync('npm run build', { cwd: repoPath, stdio: 'inherit' });
    return { outputDir: 'dist' };
  }
}

// Injects `base: '/repo-name/'` into vite.config.ts (plain Svelte)
function setViteBase(repoPath, repoName) {
  const configPath = path.join(repoPath, 'vite.config.ts');
  if (!fs.existsSync(configPath)) return;

  let src = fs.readFileSync(configPath, 'utf8');
  if (src.includes('base:')) return; // already set

  src = src.replace(
    'defineConfig({',
    `defineConfig({\n  base: '/${repoName}/',`
  );
  fs.writeFileSync(configPath, src);
}

// Injects `paths: { base: '/repo-name' }` into svelte.config.js (SvelteKit)
function setSvelteKitBase(repoPath, repoName) {
  const configPath = path.join(repoPath, 'svelte.config.js');
  if (!fs.existsSync(configPath)) return;

  let src = fs.readFileSync(configPath, 'utf8');
  if (src.includes('paths:')) return; // already set

  src = src.replace(
    'kit:',
    `kit:\n    paths: { base: '/${repoName}' },`
  );
  fs.writeFileSync(configPath, src);
}

module.exports = { detect, build };
