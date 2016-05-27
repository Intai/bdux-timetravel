'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    ignoreSass = require('ignore-styles'),
    babel = require('babel-core/register'),
    spawn = require('child_process').spawn,
    srcFiles = './src/**/!(*.spec).js',
    sassFiles = './src/**/*.scss',
    testFiles = './src/**/*.spec.js';

gulp.task('clean', function () {
  require('del').sync('lib');
});

gulp.task('cover', function(cb) {
  var cmd = spawn('node', [
    'node_modules/istanbul/lib/cli.js',
    'cover',
    '--root', '.',
    'node_modules/mocha/bin/_mocha',
    '--', '--opts', '.mocha.opts'
  ], {
    stdio: 'inherit'
  });

  cmd.on('close', cb);
});

gulp.task('test', function() {
  return gulp.src(testFiles, { read: false })
    .pipe($.mocha());
});

gulp.task('lint', function () {
  return gulp.src(srcFiles)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('babel', function() {
  return gulp.src(srcFiles)
    .pipe($.babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('sass', function() {
  return gulp.src(sassFiles)
    .pipe(gulp.dest('lib'));
});

gulp.task('watch', function() {
  gulp.watch([srcFiles, testFiles], ['test']);
});

gulp.task('build', [
  'clean',
  'babel',
  'sass'
]);

gulp.task('default', [
  'lint',
  'test',
  'watch'
]);
