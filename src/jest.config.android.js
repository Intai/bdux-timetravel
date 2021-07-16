module.exports = {
  haste: {
    defaultPlatform: 'android',
    platforms: ['android', 'ios', 'native'],
  },
  preset: 'react-native',
  coverageReporters: ['html', 'lcov'],
  coverageDirectory: '../coverage.android',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'timetravel-action',
    'common-util.js',
  ],
  testMatch: ['**/?(*.)(android|native).jest.[jt]s?(x)'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}
