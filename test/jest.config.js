module.exports = {
  rootDir: '../',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    // Transform typescript files using tsTransform file.
    '^.+\\.(ts|tsx)$': '<rootDir>/test/utils/tsTransform.js',
  },
  testMatch: [
    // Match anything within __tests__ folders.
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    // Match any typescript or javascript file ending with spec or test.
    '**/?(*.)(spec|test).(ts|tsx|js|jsx)',
  ],
};
