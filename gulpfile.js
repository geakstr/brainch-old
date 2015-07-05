var gulp = require('gulp');
var nodemon = require('nodemon');
var webpack = require('webpack');
var configs = {
  webpack: {
    web: {
      frontend: require('./configs/webpack.frontend.js')
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

gulp.task('bundle-web-frontend', function(done) {
  webpack(configs.webpack.web.frontend).run(onBundle(done));
});

gulp.task('watch-web-frontend', function() {
  webpack(configs.webpack.web.frontend).watch(100, onBundle());
});

gulp.task('bundle-web', ['bundle-web-frontend']);
gulp.task('watch-web', ['watch-web-frontend']);

gulp.task('run-web', ['watch-web'], function() {
  nodemon({
    script: __dirname + '/app/web/private/backend/js/server.js',
    watch: [__dirname + '/app/web/private/backend/js/*.js'],
    ext: 'js html'
  }).on('restart', function() {
    console.log('Web server restarted');
  });
});