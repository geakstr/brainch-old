var Duplex = require('stream').Duplex;
var WebSocketServer = require('ws').Server;
var livedbmongo = require('livedb-mongo');
var livedb = require('livedb');
var sharejs = require('share');

(function() {
  var socket_server, memory, db, mongo, share, sockets;

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

  sockets = [];
  socket_server = new WebSocketServer({
    port: 8888
  });
  socket_server.on('connection', function(socket) {
    var stream;

    socket.uid = sockets.length;
    sockets.push(socket);
    console.log('Socket %s was connected', socket.uid);

    stream = new Duplex({
      objectMode: true
    });
    stream.headers = socket.upgradeReq.headers;
    stream.remoteAddress = socket.upgradeReq.connection.remoteAddress;
    stream._read = function() {};
    stream._write = function(chunk, encoding, callback) {
      console.log('s -> c ', chunk);
      socket.send(JSON.stringify(chunk));
      callback();
    };
    stream.on('error', function(error) {
      socket.close(error);
    });
    stream.on('end', function() {
      socket.close();
    });
    share.listen(stream);

    socket.onclose = function(reason) {
      var i, l;

      stream.push(null);
      stream.emit('close');

      socket.close(reason);
      sockets.splice(socket.uid, 1);
      for (i = socket.uid, l = sockets.length; i < l; i += 1) {
        sockets[i].uid = i;
      }
      console.log('Socket %s was closed', socket.uid);
    };

    socket.on('message', function(json) {
      console.log('c -> s ', json);
      stream.push(JSON.parse(json));
    });
  });
})();