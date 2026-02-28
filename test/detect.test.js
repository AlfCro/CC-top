const fs = require('fs');
const os = require('os');
const path = require('path');
const { detect } = require('../src/detect');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cc-top-test-'));
}

// Test case 1: Plain Static — no package.json, has index.html
function testPlainStatic() {
  const dir = makeTempDir();
  fs.writeFileSync(path.join(dir, 'index.html'), '<h1>Hello</h1>');

  const result = detect(dir);

  console.assert(result !== null, 'should detect a config');
  console.assert(result.type === 'static', `type should be "static", got "${result.type}"`);
  console.assert(result.buildCommand === null, 'buildCommand should be null');
  console.assert(result.outputDir === '.', 'outputDir should be "."');
  console.assert(result.baseUrl === null, 'baseUrl should be null');

  fs.rmSync(dir, { recursive: true });
  console.log('PASS: Plain Static detected correctly');
}

// Negative: has package.json — should not match static
function testNotStaticWhenPackageJsonPresent() {
  const dir = makeTempDir();
  fs.writeFileSync(path.join(dir, 'index.html'), '<h1>Hello</h1>');
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');

  const result = detect(dir);

  console.assert(result === null, 'should return null when package.json is present');

  fs.rmSync(dir, { recursive: true });
  console.log('PASS: Not detected as static when package.json exists');
}

// Negative: no index.html — should not match static
function testNotStaticWhenNoIndexHtml() {
  const dir = makeTempDir();

  const result = detect(dir);

  console.assert(result === null, 'should return null when index.html is missing');

  fs.rmSync(dir, { recursive: true });
  console.log('PASS: Not detected as static when index.html is missing');
}

testPlainStatic();
testNotStaticWhenPackageJsonPresent();
testNotStaticWhenNoIndexHtml();
