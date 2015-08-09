var packageJson = require('./package.json');
if (packageJson.namedModules) {
  require('node-named-modules')();
}

var path = require('path');
var gulp = require('gulp');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');

require('./configs/api/gulp.dev.tasks.js');
require('./configs/collaborator/gulp.dev.tasks.js');
require('./configs/web/backend/gulp.dev.tasks.js');
require('./configs/web/frontend/gulp.dev.tasks.js');
require('./configs/web/frontend/gulp.dev.test.tasks.js');

var pathes = require('pathes');

gulp.task('common-watch-named-modules', function() {
  if (packageJson.namedModules) {
    var paths = Object.keys(packageJson.namedModules).map(function(key) {
      return packageJson.namedModules[key];
    });

    gulp.watch(paths, ['build-dev-web-frontend']);
  }
});

gulp.task('default', ['run-dev-web', 'common-watch-named-modules']);

gulp.task('run-dev-web', ['run-dev-web-frontend', 'run-dev-web-backend']);

gulp.task('jscs', function() {
  return gulp.src([
      path.join(pathes.app.web.private.backend.js, '/**/*.js'),
      path.join(pathes.app.web.private.frontend.js, '/**/*.js'),
      path.join(pathes.app.collaborator.js, '/**/*.js'),
      path.join(pathes.app.api.js, '/**/*.js')
    ])
    .pipe(jscs());
});

gulp.task('eslint', function() {
  return gulp.src(['./'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});