var path = require('path');
var gulp = require('gulp');
var nodemon = require('nodemon');
var notifier = require('node-notifier');

var pathes = require('pathes');

gulp.task('run-dev-web-backend', function() {
  nodemon({
    script: path.join(pathes.app.web.private.backend.js, '/index.js'),
    watch: [
      path.join(pathes.app.web.private.backend.js, '/**/*.js'),
      path.join(pathes.app.web.private.backend.views, '/**/*.html')
    ],
    ext: 'js html',
    nodeArgs: ['--harmony']
  }).on('restart', function() {
    console.log('Web server restarted');
  }).on('crash', function(error) {
    notifier.notify({
      title: 'Gulp',
      message: 'Nodemon error',
      sound: true,
      wait: false
    });
  });
});