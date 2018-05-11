const tsc = require('typescript');

/**
 * Transpile .ts and .tsx files for Jest testing.
 */
module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return tsc.transpile(src, { module: 'commonjs', jsx: 'react' }, path, []);
    }
    return src;
  },
};
