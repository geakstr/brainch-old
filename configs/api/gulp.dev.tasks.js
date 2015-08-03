var path = require('path');
var gulp = require('gulp');
var nodemon = require('nodemon');
var notifier = require('node-notifier');

var pathes = require('pathes');

gulp.task('run-dev-api', function() {
  nodemon({
    script: path.join(pathes.app.api.js, '/index.js'),
    watch: [
      path.join(pathes.app.api.js, '/**/*.js')
    ],
    ext: 'js html',
    nodeArgs: ['--harmony']
  }).on('restart', function() {
    console.log('API restarted');
  }).on('crash', function(error) {
    notifier.notify({
      title: 'Gulp',
      message: 'Nodemon error',
      sound: true,
      wait: false
    });
  });
});