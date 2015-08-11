'use strict';

var app = require('brainch-frontend/app');

window.onload = function() {
  require('brainch-frontend/editor')(document.querySelector('#editor'));
};

window.onbeforeunload = function(e) {
  if (app.api.sjs && app.api.sjs.socket) {
    app.api.sjs.socket.onclose();
  }
};