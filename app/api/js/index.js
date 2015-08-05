var WebSocketServer = require('ws').Server;
var protocol = require('common/protocol');

(function() {
  var wss, port, sockets;

  port = 8888;

  wss = new WebSocketServer({
    port: port
  });

  sockets = [];

  wss.broadcast = function(self_uid, data) {
    sockets.forEach(function(ws) {
      if (ws.uid !== self_uid) {
        ws.send(data, function(error) {
          if (typeof error === 'undefined') {
            return;
          }
          console.log(error);
        });
      }
    });
  };

  wss.on('connection', function(ws) {
    ws.uid = sockets.length;
    sockets.push(ws);

    console.log('Socket %s was connected', ws.uid);

    ws.onclose = function() {
      var i, l;

      sockets.splice(ws.uid, 1);

      l = sockets.length;
      for (i = ws.uid; i < l; i += 1) {
        sockets[i].uid = i;
      }

      console.log('Socket %s was closed', ws.uid);
    };

    ws.on('message', function(json) {
      var data, type;

      console.log(json);

      data = JSON.parse(json);
      type = data[1];

      data[0] = Date.now();

      switch (type) {
        case protocol.message.batch_history:
          wss.broadcast(ws.uid, JSON.stringify(data));
          break;
      }
    });
  });
})();