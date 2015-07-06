var path = require('path');
var gulp = require('gulp');
var webpack = require('webpack');
var stylus = require('gulp-stylus');
var koutoSwiss = require('kouto-swiss');
var autoprefixer = require('gulp-autoprefixer');

var common = require('commonconfigs');

gulp.task('css-dev-web-frontend', function() {
  return gulp.src(path.join(common.paths.app.web.private.frontend.stylus, '/style.styl'))
    .pipe(stylus({
      'include css': true,
      'use': [koutoSwiss()]
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(gulp.dest(common.paths.app.web.public.css));
});

gulp.task('webpack-dev-web-frontend', function(done) {
  webpack(common.configs.webpack.web.frontend).run((function() {
    return function(err, stats) {
      if (err) {
        console.log('Error', err);
      } else {
        console.log(stats.toString());
      }
      if (done) {
        done();
      }
    };
  })());
});

gulp.task('watch-dev-web-frontend', function() {
  gulp.watch(path.join(common.configs.webpack.web.frontend.context, '/**/*.js'), ['webpack-dev-web-frontend']);
  gulp.watch(path.join(common.paths.app.web.private.frontend.stylus, '/**/*.styl'), ['css-dev-web-frontend']);
});

gulp.task('build-dev-web-frontend', ['webpack-dev-web-frontend', 'css-dev-web-frontend']);

gulp.task('run-dev-web-frontend', ['watch-dev-web-frontend', 'build-dev-web-frontend']);