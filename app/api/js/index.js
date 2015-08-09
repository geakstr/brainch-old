'use strict';

var express = require('express');

(function() {
  var app, server;

  app = express();

  app.get('/', function(req, res) {
    res.json({
      message: 'azaza'
    });
  });

  server = app.listen(7777, function() {
    console.log('API started on port %s', server.address().port);
  });
})();