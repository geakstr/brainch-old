var gulp = require('gulp');
var nodemon = require('nodemon');
var webpack = require('webpack');
var babel = require('gulp-babel');

var configs = {
  webpack: {
    web: {
      frontend: require('./configs/webpack.web.frontend.js')
    }
  }
};

function onBundle(done) {
  return function(err, stats) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log(stats.toString());
    }
    if (done) {
      done();
    }
  }
}

gulp.task('build-web-frontend', function(done) {
  webpack(configs.webpack.web.frontend).run(onBundle(done));
});

gulp.task('watch-web-frontend', function() {
  webpack(configs.webpack.web.frontend).watch(100, onBundle());
});

gulp.task('build-web-backend', function(done) {
  return gulp.src(__dirname + '/app/web/private/backend/js/es6/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest(__dirname + '/app/web/private/backend/js/es5'));
});

gulp.task('watch-web-frontend', function() {
  gulp.watch(__dirname + '/app/web/private/backend/js/es6/**/*.js', ['build-web-backend']);
});

gulp.task('build-web', ['build-web-frontend', 'build-web-backend']);
gulp.task('watch-web', ['watch-web-frontend', 'watch-web-frontend']);

gulp.task('run-web', ['watch-web', 'build-web'], function() {
  nodemon({
    script: __dirname + '/app/web/private/backend/js/es5/index.js',
    watch: [
      __dirname + '/app/web/private/backend/js/es5/**/*.js',
    ],
    ext: 'js html',
    nodeArgs: ['--harmony']
  }).on('restart', function() {
    console.log('Web server restarted');
  });
});