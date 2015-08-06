'use strict';

var app = require('common/app');

window.onload = function() {
  require('frontend/editor')(document.querySelector('#editor'));
};

window.onbeforeunload = function(e) {
  if (app.api.sjs && app.api.sjs.socket) {
    app.api.sjs.socket.onclose();
  }
};