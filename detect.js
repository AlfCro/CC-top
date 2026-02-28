#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Detects the build configuration for a GitHub Pages project.
 *
 * Test cases (from TesttCases.md):
 *  1  - Plain Static (no build)
 *  2  - React CRA + npm
 *  3  - React Vite + Bun
 *  4  - Vue 3 Vite + pnpm
 *  5  - Angular + pnpm
 *  6a - Svelte (Vite) + npm
 *  6b - SvelteKit static adapter + Bun
 *  7  - Next.js static export + Yarn
 *  8  - Astro + npm
 *  9  - Vanilla Vite + pnpm
 *  10 - Jekyll
 *  12 - Hugo + npm scripts  ← this file's primary focus
 */
function detectBuildConfig(repoDir) {
  const entries = fs.readdirSync(repoDir);
  const has = (name) => entries.includes(name);

  // Read package.json if present
  let pkg = null;
  if (has('package.json')) {
    pkg = JSON.parse(fs.readFileSync(path.join(repoDir, 'package.json'), 'utf8'));
  }
  const deps = Object.assign({}, pkg?.dependencies, pkg?.devDependencies);
  const buildScript = pkg?.scripts?.build || '';

  // Detect package manager from lock file
  function pkgManager() {
    if (has('bun.lockb'))        return 'bun';
    if (has('pnpm-lock.yaml'))   return 'pnpm';
    if (has('yarn.lock'))        return 'yarn';
    return 'npm';
  }

  // ── Case 10: Jekyll ──────────────────────────────────────────────────────
  if (has('_config.yml') && !pkg) {
    return {
      case: 10,
      type: 'jekyll',
      buildCommand: null,          // GitHub Pages builds it automatically
      outputDir: '_site',
      baseUrlNote: 'Set baseurl in _config.yml',
    };
  }

  // ── Case 12: Hugo + npm scripts ──────────────────────────────────────────
  // Detect by: hugo.toml or config.toml present, and build script calls hugo
  const hasHugoConfig = has('hugo.toml') || has('config.toml');
  const buildCallsHugo = buildScript.includes('hugo');

  if (hasHugoConfig || buildCallsHugo) {
    const pm = pkgManager();
    const buildCommand = pkg ? `${pm} run build` : 'hugo --minify';
    return {
      case: 12,
      type: 'hugo',
      packageManager: pkg ? pm : null,
      buildCommand,
      outputDir: 'public',
      baseUrlNote: 'Set baseURL in hugo.toml, e.g. "https://user.github.io/repo-name/"',
      configFile: has('hugo.toml') ? 'hugo.toml' : 'config.toml',
    };
  }

  // ── Case 1: Plain Static ─────────────────────────────────────────────────
  if (!pkg && has('index.html')) {
    return {
      case: 1,
      type: 'static',
      buildCommand: null,
      outputDir: '.',
      baseUrlNote: 'Relative URLs work without any config',
    };
  }

  if (!pkg) return null;

  const pm = pkgManager();
  const run = pm === 'npm' ? 'npm run build'
            : pm === 'yarn' ? 'yarn build'
            : `${pm} run build`;

  // ── Case 2: React CRA + npm ──────────────────────────────────────────────
  if (deps['react-scripts']) {
    return {
      case: 2,
      type: 'react-cra',
      packageManager: pm,
      buildCommand: run,
      outputDir: 'build',
      baseUrlNote: 'Set "homepage" field in package.json',
    };
  }

  // ── Case 6b: SvelteKit static adapter ────────────────────────────────────
  if (deps['@sveltejs/kit']) {
    return {
      case: '6b',
      type: 'sveltekit',
      packageManager: pm,
      buildCommand: run,
      outputDir: 'build',
      baseUrlNote: 'Set kit.paths.base in svelte.config.js',
    };
  }

  // ── Vite-based projects ───────────────────────────────────────────────────
  if (deps['vite']) {
    const viteBase = 'Set base in vite.config.ts, e.g. base: \'/repo-name/\'';

    // Case 3: React + Vite
    if (deps['@vitejs/plugin-react'] || deps['react']) {
      return { case: 3, type: 'react-vite', packageManager: pm, buildCommand: run, outputDir: 'dist', baseUrlNote: viteBase };
    }
    // Case 4: Vue + Vite
    if (deps['vue']) {
      return { case: 4, type: 'vue-vite', packageManager: pm, buildCommand: run, outputDir: 'dist', baseUrlNote: viteBase };
    }
    // Case 6a: Svelte (no Kit) + Vite
    if (deps['svelte']) {
      return { case: '6a', type: 'svelte-vite', packageManager: pm, buildCommand: run, outputDir: 'dist', baseUrlNote: viteBase };
    }
    // Case 9: Vanilla Vite
    return { case: 9, type: 'vanilla-vite', packageManager: pm, buildCommand: run, outputDir: 'dist', baseUrlNote: viteBase };
  }

  // ── Case 5: Angular ───────────────────────────────────────────────────────
  if (deps['@angular/core']) {
    return {
      case: 5,
      type: 'angular',
      packageManager: pm,
      buildCommand: `${pm} ng build --configuration production --base-href /repo-name/`,
      outputDir: 'dist',
      baseUrlNote: '--base-href flag or baseHref in angular.json',
    };
  }

  // ── Case 7: Next.js static export ────────────────────────────────────────
  if (deps['next']) {
    return {
      case: 7,
      type: 'nextjs',
      packageManager: pm,
      buildCommand: run,
      outputDir: 'out',
      baseUrlNote: 'Set basePath and assetPrefix in next.config.js',
    };
  }

  // ── Case 8: Astro ─────────────────────────────────────────────────────────
  if (deps['astro']) {
    return {
      case: 8,
      type: 'astro',
      packageManager: pm,
      buildCommand: run,
      outputDir: 'dist',
      baseUrlNote: 'Set site and base in astro.config.mjs',
    };
  }

  return null;
}

// ── CLI usage ────────────────────────────────────────────────────────────────
if (require.main === module) {
  const dir = process.argv[2] || process.cwd();
  const config = detectBuildConfig(dir);
  if (config) {
    console.log(JSON.stringify(config, null, 2));
  } else {
    console.error('Could not detect build configuration.');
    process.exit(1);
  }
}

module.exports = { detectBuildConfig };
