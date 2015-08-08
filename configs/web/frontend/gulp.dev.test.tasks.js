var path = require('path');
var gulp = require('gulp');
var webpack = require('webpack');
var notifier = require('node-notifier');

var pathes = require('pathes');

gulp.task('webpack-test-web-frontend', function(done) {
  webpack(pathes.configs.web.frontend.test.webpack,
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

gulp.task('watch-test-web-frontend', function() {
  gulp.watch([
    path.join(pathes.configs.web.frontend.dev.webpack.context, '/**/*.js'),
    path.join(pathes.configs.web.frontend.test.webpack.context, '/**/*.js'),
    path.join(pathes.app.common.js, '/**/*.js')
  ], ['webpack-test-web-frontend']);
});

gulp.task('build-test-web-frontend', ['webpack-test-web-frontend']);

gulp.task('run-test-web-frontend', ['watch-test-web-frontend', 'build-test-web-frontend']);