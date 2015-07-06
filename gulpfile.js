var path = require('path');
var gulp = require('gulp');
var nodemon = require('nodemon');
var webpack = require('webpack');
var babel = require('gulp-babel');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');

var configs = {
  webpack: {
    web: {
      frontend: require('./configs/webpack.web.frontend.js')
    }
  }
};

var paths = {
  app: {
    web: {
      private: {
        backend: {
          js: {
            es6: path.join(process.cwd(), 'app/web/private/backend/js/es6'),
            es5: path.join(process.cwd(), 'app/web/private/backend/js/es5'),
          },
          views: path.join(process.cwd(), 'app/web/private/backend/views')
        },
        frontend: {
          js: path.join(process.cwd(), 'app/web/private/frontend/js')
        }
      }
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
  };
}

gulp.task('build-web-frontend', function(done) {
  webpack(configs.webpack.web.frontend).run(onBundle(done));
});

gulp.task('watch-web-frontend', function() {
  webpack(configs.webpack.web.frontend).watch(100, onBundle());
});

gulp.task('build-web-backend', function() {
  return gulp.src(path.join(paths.app.web.private.backend.js.es6, '/**/*.js'))
    .pipe(babel())
    .pipe(gulp.dest(paths.app.web.private.backend.js.es5));
});

gulp.task('watch-web-backend', function() {
  gulp.watch(path.join(paths.app.web.private.backend.js.es6, '/**/*.js'), ['build-web-backend']);
});

gulp.task('build-web', ['build-web-frontend', 'build-web-backend']);
gulp.task('watch-web', ['watch-web-frontend', 'watch-web-backend']);

gulp.task('run-web', ['watch-web', 'build-web'], function() {
  nodemon({
    script: path.join(paths.app.web.private.backend.js.es5, '/index.js'),
    watch: [
      path.join(paths.app.web.private.backend.js.es5, '/**/*.js'),
      path.join(paths.app.web.private.backend.views, '/**/*.html')
    ],
    ext: 'js html',
    nodeArgs: ['--harmony']
  }).on('restart', function() {
    console.log('Web server restarted');
  });
});



gulp.task('jscs', function() {
  return gulp.src([
      path.join(paths.app.web.private.backend.js.es6, '/**/*.js'),
      path.join(paths.app.web.private.frontend.js, '/**/*.js')
    ])
    .pipe(jscs());
});

gulp.task('eslint', function() {
  return gulp.src(['./'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});