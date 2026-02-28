const fs = require('fs');
const path = require('path');

/**
 * Detects the build configuration for a given repo directory.
 * Returns an object with: { type, buildCommand, outputDir, baseUrl }
 */
function detect(repoDir) {
  const hasPackageJson = fs.existsSync(path.join(repoDir, 'package.json'));
  const hasIndexHtml = fs.existsSync(path.join(repoDir, 'index.html'));

  // Test case 1: Plain Static (No Build)
  if (!hasPackageJson && hasIndexHtml) {
    return {
      type: 'static',
      buildCommand: null,
      outputDir: '.',
      baseUrl: null,
    };
  }

  return null;
}

module.exports = { detect };
