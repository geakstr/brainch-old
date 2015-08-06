'use strict';

var app = require('common/app');
var config = require('frontend/configs');
var sharejs = require('share/lib/client');

module.exports = function(oninit, onopen) {
  app.api.sjs = new sharejs.Connection(new WebSocket(config.api.ws.url));
  oninit(onopen);
  setInterval(function() {
    if (app.api.sjs.state === 'disconnected') {
      app.api.sjs.bindToSocket(new WebSocket(config.api.ws.url));
    }
  }, 10000);
};