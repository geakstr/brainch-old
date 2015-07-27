var path = require('path');
var gulp = require('gulp');
var webpack = require('webpack');
var stylus = require('gulp-stylus');
var koutoSwiss = require('kouto-swiss');
var autoprefixer = require('gulp-autoprefixer');
var notifier = require('node-notifier');

var configs = require('commonconfigs');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('css-dev-web-frontend', function() {
  var stylusPipe = stylus({
    'include css': true,
    'use': [koutoSwiss()]
  });

  stylusPipe.on('error', function(e) {
    notifier.notify({
      title: 'Gulp',
      message: 'Stylus error',
      sound: true,
      wait: false
    });
    console.log(e);
    stylusPipe.end();
  });

  return gulp.src(path.join(configs.paths.app.web.private.frontend.stylus, '/style.styl'))
    .pipe(sourcemaps.init())
    .pipe(stylusPipe)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(configs.paths.app.web.public.css));
});

gulp.task('webpack-dev-web-frontend', function(done) {
  webpack(configs.configs.webpack.web.frontend,
    function(err, stats) {
      if (err) {
        console.log('Error', err);
      } else {
        var o = stats.toString();
        if (o.indexOf('ERROR in ') !== -1) {
          notifier.notify({
            title: 'Gulp',
            message: 'Webpack build error',
            sound: true,
            wait: false
          });
        }
        console.log(o);
      }
      if (done) {
        done();
      }
    });
});

gulp.task('watch-dev-web-frontend', function() {
  gulp.watch(path.join(configs.configs.webpack.web.frontend.context, '/**/*.js'), ['webpack-dev-web-frontend']);
  gulp.watch(path.join(configs.paths.app.web.private.frontend.stylus, '/**/*.styl'), ['css-dev-web-frontend']);
});

gulp.task('build-dev-web-frontend', ['webpack-dev-web-frontend', 'css-dev-web-frontend']);

gulp.task('run-dev-web-frontend', ['watch-dev-web-frontend', 'build-dev-web-frontend']);