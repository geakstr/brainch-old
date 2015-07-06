var path = require('path');
var gulp = require('gulp');
var nodemon = require('nodemon');
var babel = require('gulp-babel');

var common = require('commonconfigs');

gulp.task('js-dev-web-backend', function() {
  return gulp.src([path.join(common.paths.app.web.private.backend.js.es6, '/**/*.js')])
    .pipe(babel())
    .pipe(gulp.dest(common.paths.app.web.private.backend.js.es5));
});

gulp.task('watch-dev-web-backend', function() {
  gulp.watch(path.join(common.paths.app.web.private.backend.js.es6, '/**/*.js'), ['js-dev-web-backend']);
});

gulp.task('build-dev-web-backend', ['js-dev-web-backend']);

gulp.task('run-dev-web-backend', ['watch-dev-web-backend', 'build-dev-web-backend'], function() {
  nodemon({
    script: path.join(common.paths.app.web.private.backend.js.es5, '/index.js'),
    watch: [
      path.join(common.paths.app.web.private.backend.js.es5, '/**/*.js'),
      path.join(common.paths.app.web.private.backend.views, '/**/*.html')
    ],
    ext: 'js html',
    nodeArgs: ['--harmony']
  }).on('restart', function() {
    console.log('Web server restarted');
  });
});