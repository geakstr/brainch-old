var Duplex = require('stream').Duplex;
var livedbmongo = require('livedb-mongo');
var livedb = require('livedb');
var sharejs = require('share');
var browserChannel = require('browserchannel').server;
var connect = require('connect');
var http = require('http');

var memory, db, mongo, share;

memory = true;
if (memory) {
  db = livedb.client(livedb.memory());
} else {
  mongo = livedbmongo('mongodb://localhost:27017/brainch');
  db = livedb.client(mongo);
}
share = sharejs.server.createClient({
  backend: db
});

var server = connect();
server.use(browserChannel({
  webserver: server,
  cors: '*'
}, function(client) {
  var stream = new Duplex({
    objectMode: true
  });

  stream._read = function() {};
  stream._write = function(chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
      client.send(JSON.stringify(chunk));
    }
    callback();
  };
  stream.headers = client.headers;
  stream.remoteAddress = stream.address;
  stream.on('error', function(msg) {
    client.stop();
  });
  stream.on('end', function() {
    client.close();
  });
  share.listen(stream);

  client.on('message', function(data) {
    console.log('c -> s ', data);
    stream.push(data);
  });
  client.on('close', function(reason) {
    stream.push(null);
    stream.emit('close');
    stream.emit('end');
    stream.end();
  });
}));

http.createServer(server).listen(8888);