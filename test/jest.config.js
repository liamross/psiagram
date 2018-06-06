module.exports = {
  rootDir: '../',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': '<rootDir>/test/transformers/typescript.js',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    // Match anything within __tests__ folders.
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    // Match any typescript or javascript file ending with spec or test.
    '**/?(*.)(spec|test).(ts|tsx|js|jsx)',
  ],
  coverageDirectory: './coverage/',
  collectCoverage: true,
};
