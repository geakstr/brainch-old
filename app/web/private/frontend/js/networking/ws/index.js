'use strict';

var app = require('common/app');

module.exports = function(onopen, onclose, onmessage, onerror) {
  var create_ws, ws_repeater, ws_repeater_factory;

  ws_repeater_factory = function() {
    clearInterval(ws_repeater);
    ws_repeater = setInterval(function() {
      if (!app.api.ws || app.api.ws.readyState === 3) {
        console.log('Trying connect to API...');
        create_ws();
      } else {
        clearInterval(ws_repeater);
      }
    }, 1000);
  };

  create_ws = function() {
    try {
      app.api.ws = new WebSocket(app.api.ws.url);

      app.api.ws.onopen = function() {
        clearInterval(ws_repeater);
        console.log('Socket was opened');
        onopen();
      };

      app.api.ws.onclose = function(e) {
        onclose();
        console.log('Socket was closed. Code: %s', e.code);
        ws_repeater_factory();
      };

      app.api.ws.onmessage = function(e) {
        onmessage(e.data, e);
      };

      app.api.ws.onerror = function(error) {
        console.log('Socket error: %s', error.message);
        if (onerror) {
          onerror();
        }
      };
    } catch (e) {
      ws_repeater_factory();
    }
  };
  create_ws();
};