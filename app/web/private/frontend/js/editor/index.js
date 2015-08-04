'use strict';

var protocol = require('common/protocol');
var state = require('common/editor/state');

module.exports = function(container) {
  var that, model, events, ws;

  ws = new WebSocket('ws://localhost:8888');
  model = require('common/editor/model')(container, ws);
  events = require('frontend/editor/actions/events')(model, ws);

  state.dom.html.length = container.innerHTML.length;

  ws.onopen = function() {
    container.setAttribute('spellcheck', false);
    container.setAttribute('contenteditable', true);

    container.onkeydown = events.keydown;
    container.onkeyup = events.keyup;
    container.onpaste = events.paste;
    container.oncut = events.cut;
    container.oncopy = events.copy;

    console.log('Socket was opened');
  };

  ws.onclose = function(event) {
    container.setAttribute('contenteditable', false);

    container.onkeydown = null;
    container.onkeyup = null;
    container.onpaste = null;
    container.oncut = null;
    container.oncopy = null;

    console.log('Socket was closed. Code: %s; Reason: %s', event.code, event.reason);
  };

  ws.onerror = function(error) {
    console.log('Socket error: %s', error.message);
  };

  ws.onmessage = function(e) {
    var data, type;

    data = JSON.parse(e.data);
    type = data[1];

    switch (type) {
      case protocol.message.batch_history:
        model.history.apply(data[2], data[3], data[4], data[5]);
        break;
    }
  };

  window.onbeforeunload = function(e) {
    ws.close();
  };

  that = {
    get model() {
      return model;
    },

    get dom() {
      return container;
    }
  };

  return that;
};