var WebSocketServer = require('ws').Server;

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

      data = JSON.parse(json);
      type = data.type;

      switch (type) {
        case 'history_batch':
          wss.broadcast(ws.uid, json);
          break;
      }
    });
  });
})();