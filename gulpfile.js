var path = require('path');
var gulp = require('gulp');
var requireDir = require('require-dir');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');

var common = require('./configs/common.js');

requireDir('./configs/gulp', {
  recurse: true
});

gulp.task('default', ['run-dev-web']);

gulp.task('run-dev-web', ['run-dev-web-frontend', 'run-dev-web-backend']);

gulp.task('jscs', function() {
  return gulp.src([
      path.join(common.paths.app.web.private.backend.js.es6, '/**/*.js'),
      path.join(common.paths.app.web.private.frontend.js, '/**/*.js')
    ])
    .pipe(jscs());
});

gulp.task('eslint', function() {
  return gulp.src(['./'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});