var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');

var app = express();

app.use('/static', express.static(path.join(__dirname, '/../../../public')));

nunjucks.configure(path.join(__dirname, '/../views'), {
  autoescape: true,
  express: app
});

app.get('/', function(req, res) {
  res.render('index.html');
});

var server = app.listen(8000, function() {
  console.log('Web server started on port %s', server.address().port);
});