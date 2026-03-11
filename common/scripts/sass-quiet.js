// Wrapper around sass to suppress legacy-js-api deprecation warnings
// Should be removed when sass-preprocessor is upgraded to the version that works with modern sass api

// Install the stderr filter globally as early as possible
if (!process.stderr._originalWrite) {
  process.stderr._originalWrite = process.stderr.write;
  
  process.stderr.write = function (chunk, encoding, callback) {
    const chunkStr = typeof chunk === 'string' ? chunk : (chunk?.toString?.() || '');
    
    // Filter out sass legacy API deprecation warnings
    if (chunkStr.includes('Deprecation Warning [legacy-js-api]') || 
        chunkStr.includes('DEPRECATION WARNING [legacy-js-api]') ||
        chunkStr.includes('The legacy JS API is deprecated') ||
        chunkStr.includes('More info: https://sass-lang.com/d/legacy-js-api')) {
      // Suppress the warning - just call the callback
      if (typeof encoding === 'function') {
        encoding();
      } else if (typeof callback === 'function') {
        callback();
      }
      return true;
    }
    
    return process.stderr._originalWrite.call(this, chunk, encoding, callback);
  };
}

// Try to require sass from the caller's context
// This works around the issue where sass-quiet.js is in common/scripts
// but sass is installed in common/temp/node_modules
let sass;
try {
  // First try normal require (works if called from a package with sass dependency)
  sass = require('sass');
} catch (e) {
  // If that fails, try to resolve from common/temp/node_modules
  const path = require('path');
  const sassPath = path.join(__dirname, '../temp/node_modules/.pnpm');
  const fs = require('fs');

  // Find sass directory in pnpm store
  if (fs.existsSync(sassPath)) {
    const dirs = fs.readdirSync(sassPath);
    const sassDir = dirs.find(dir => dir.startsWith('sass@'));
    if (sassDir) {
      sass = require(path.join(sassPath, sassDir, 'node_modules/sass'));
    } else {
      throw new Error('Cannot find sass module in pnpm store');
    }
  } else {
    throw e;
  }
}

module.exports = sass;
