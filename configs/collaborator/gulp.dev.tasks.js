var path = require('path');
var gulp = require('gulp');
var nodemon = require('nodemon');
var notifier = require('node-notifier');

var pathes = require('brainch-pathes');

gulp.task('run-dev-collaborator', function() {
  nodemon({
    script: path.join(pathes.app.collaborator.js, '/index.js'),
    watch: [
      path.join(pathes.app.collaborator.js, '/**/*.js')
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