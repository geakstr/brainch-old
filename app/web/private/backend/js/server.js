var express = require('express');
var ejs = require('ejs');
var app = express();

app.use('/static', express.static(__dirname + '/../../../public'));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/../views')


app.get('/', function(req, res) {
  res.render('index');
});


var server = app.listen(8000, function() {
  var port = server.address().port;

  console.log('Web server started on port %s', port);
});