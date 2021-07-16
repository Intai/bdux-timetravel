module.exports = {
  preset: 'react-native',
  coverageReporters: ['html', 'lcov'],
  coverageDirectory: '../coverage.ios',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'timetravel-action',
    'common-util.js',
  ],
  testMatch: ['**/?(*.)(ios|native).jest.[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}
