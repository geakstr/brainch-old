var path = require('path');
var gulp = require('gulp');
var requireDir = require('require-dir');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');

var packageJson = require('./package.json');

if (packageJson.namedModules) {
  require('node-named-modules')();
}

var common = require('commonconfigs');

requireDir('./configs/gulp', {
  recurse: true
});

gulp.task('common-watch-named-modules', function() {
  if (packageJson.namedModules) {
    var paths = Object.keys(packageJson.namedModules).map(function(key) {
      return packageJson.namedModules[key];
    });

    gulp.watch(paths, ['build-dev-web-frontend', 'build-dev-web-backend']);
  }
});

gulp.task('default', ['run-dev-web', 'common-watch-named-modules']);

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