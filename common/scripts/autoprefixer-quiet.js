// Wrapper around autoprefixer to resolve it from pnpm store
// Similar to sass-quiet.js

let autoprefixer;
try {
  // First try normal require (works if called from a package with autoprefixer dependency)
  autoprefixer = require('autoprefixer');
} catch (e) {
  // If that fails, try to resolve from common/temp/node_modules
  const path = require('path');
  const autoprefixerPath = path.join(__dirname, '../temp/node_modules/.pnpm');
  const fs = require('fs');

  // Find autoprefixer directory in pnpm store
  if (fs.existsSync(autoprefixerPath)) {
    const dirs = fs.readdirSync(autoprefixerPath);
    const autoprefixerDir = dirs.find(dir => dir.startsWith('autoprefixer@'));
    if (autoprefixerDir) {
      autoprefixer = require(path.join(autoprefixerPath, autoprefixerDir, 'node_modules/autoprefixer'));
    } else {
      throw new Error('Cannot find autoprefixer module in pnpm store');
    }
  } else {
    throw e;
  }
}

module.exports = autoprefixer;
