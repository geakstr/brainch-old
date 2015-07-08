var path = require('path');
var gulp = require('gulp');
var nodemon = require('nodemon');

var configs = require('commonconfigs');

gulp.task('run-dev-web-backend', function() {
  nodemon({
    script: path.join(configs.paths.app.web.private.backend.js, '/index.js'),
    watch: [
      path.join(configs.paths.app.web.private.backend.js, '/**/*.js'),
      path.join(configs.paths.app.web.private.backend.views, '/**/*.html')
    ],
    ext: 'js html',
    nodeArgs: ['--harmony']
  }).on('restart', function() {
    console.log('Web server restarted');
  });
});