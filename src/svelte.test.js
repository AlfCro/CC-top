const fs = require('fs');
const os = require('os');
const path = require('path');
const { detect } = require('./svelte');

function makeTempRepo(pkg, extraFiles = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-test-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  for (const f of extraFiles) fs.writeFileSync(path.join(dir, f), '');
  return dir;
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Test: plain Svelte detected as svelte-npm
{
  const dir = makeTempRepo({ dependencies: { svelte: '^4.0.0' } });
  const result = detect(dir);
  console.assert(result === 'svelte-npm', `Expected svelte-npm, got ${result}`);
  cleanup(dir);
  console.log('PASS: plain Svelte → svelte-npm');
}

// Test: SvelteKit + bun.lockb detected as sveltekit-bun
{
  const dir = makeTempRepo(
    { dependencies: { svelte: '^4.0.0', '@sveltejs/kit': '^2.0.0' } },
    ['bun.lockb']
  );
  const result = detect(dir);
  console.assert(result === 'sveltekit-bun', `Expected sveltekit-bun, got ${result}`);
  cleanup(dir);
  console.log('PASS: SvelteKit + bun.lockb → sveltekit-bun');
}

// Test: SvelteKit without bun.lockb falls back to svelte-npm
{
  const dir = makeTempRepo({
    dependencies: { svelte: '^4.0.0', '@sveltejs/kit': '^2.0.0' },
  });
  const result = detect(dir);
  console.assert(result === 'svelte-npm', `Expected svelte-npm, got ${result}`);
  cleanup(dir);
  console.log('PASS: SvelteKit without bun.lockb → svelte-npm');
}

// Test: non-Svelte repo returns null
{
  const dir = makeTempRepo({ dependencies: { react: '^18.0.0' } });
  const result = detect(dir);
  console.assert(result === null, `Expected null, got ${result}`);
  cleanup(dir);
  console.log('PASS: non-Svelte → null');
}

// Test: no package.json returns null
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-test-'));
  const result = detect(dir);
  console.assert(result === null, `Expected null, got ${result}`);
  cleanup(dir);
  console.log('PASS: no package.json → null');
}
