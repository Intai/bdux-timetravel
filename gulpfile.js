/* eslint-env node */

var gulp = require('gulp'),
    gulpBabel = require('gulp-babel'),
    gulpEslint = require('gulp-eslint'),
    del = require('del'),
    spawn = require('child_process').spawn,
    srcFiles = './src/**/!(*.spec|*.config).{js,jsx}',
    testFiles = './src/**/*.spec.js';

function clean() {
  return del(['es', 'lib']);
}

function coverWeb(cb) {
  var cmd = spawn('node', [
    'node_modules/cross-env/src/bin/cross-env.js', 'NODE_ENV=mocha',
    'node_modules/nyc/bin/nyc.js',
    'node_modules/mocha/bin/_mocha',
    '--require', '@babel/register',
    '--require', 'regenerator-runtime/runtime',
    'src/mocha.setup.js',
    'src/**/*.spec.js*'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
}

function coverIOS(cb) {
  var cmd = spawn('node', [
    'node_modules/cross-env/src/bin/cross-env.js', 'NODE_ENV=jest',
    'node_modules/jest/bin/jest.js',
    '--setupFilesAfterEnv="./jest.setup.js"',
    '--config="./src/jest.config.ios.js"',
    '--coverage'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
}

function coverAndroid(cb) {
  var cmd = spawn('node', [
    'node_modules/cross-env/src/bin/cross-env.js', 'NODE_ENV=jest',
    'node_modules/jest/bin/jest.js',
    '--setupFilesAfterEnv="./jest.setup.js"',
    '--config="./src/jest.config.android.js"',
    '--coverage'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
}

function testWeb(cb) {
  var cmd = spawn('node', [
    'node_modules/mocha/bin/mocha',
    '--require', '@babel/register',
    '--require', 'regenerator-runtime/runtime',
    'src/mocha.setup.js',
    'src/**/*.spec.js*'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
}

function jestIOS(cb) {
  var cmd = spawn('node', [
    'node_modules/jest/bin/jest',
    '--setupFilesAfterEnv="./jest.setup.js"',
    '--config="./src/jest.config.ios.js"'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
}

function jestAndroid(cb) {
  var cmd = spawn('node', [
    'node_modules/jest/bin/jest',
    '--setupFilesAfterEnv="./jest.setup.js"',
    '--config="./src/jest.config.android.js"'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
}

function lint() {
  return gulp.src(srcFiles)
    .pipe(gulpEslint())
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failAfterError());
}

function babel() {
  return gulp.src(srcFiles)
    .pipe(gulpBabel())
    .pipe(gulp.dest('lib'));
}

function babelEs() {
  return gulp.src(srcFiles)
    .pipe(gulpBabel({
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties'
      ]
    }))
    .pipe(gulp.dest('es'));
}

function watch() {
  gulp.watch([srcFiles, testFiles], testWeb);
}

gulp.task('test', gulp.series(
  testWeb,
  // jestIOS,
  // jestAndroid
));

gulp.task('cover', gulp.series(
  coverWeb,
  // coverIOS,
  // coverAndroid
));

gulp.task('lint', lint);

gulp.task('build', gulp.series(
  clean,
  babel,
  babelEs
));

gulp.task('default', gulp.series(
  lint,
  testWeb,
  watch
));
