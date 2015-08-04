'use strict';

var protocol = require('common/protocol');
var app = require('common/editor/state');

module.exports = function(container) {
  var that, model, events, create_ws, ws_repeater, ws_repeater_factory;

  model = require('common/editor/model')(container);
  events = require('frontend/editor/actions/events')(model);

  app.dom.html.length = container.innerHTML.length;

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
      app.api.ws = new WebSocket('ws://localhost:8888');

      app.api.ws.onopen = function() {
        clearInterval(ws_repeater);

        container.setAttribute('spellcheck', false);
        container.setAttribute('contenteditable', true);

        container.onkeydown = events.keydown;
        container.onkeyup = events.keyup;
        container.onpaste = events.paste;
        container.oncut = events.cut;
        container.oncopy = events.copy;

        console.log('Socket was opened');
      };

      app.api.ws.onclose = function(event) {
        container.setAttribute('contenteditable', false);

        container.onkeydown = null;
        container.onkeyup = null;
        container.onpaste = null;
        container.oncut = null;
        container.oncopy = null;

        console.log('Socket was closed. Code: %s; Reason: %s', event.code, event.reason);

        ws_repeater_factory();
      };

      app.api.ws.onerror = function(error) {
        console.log('Socket error: %s', error.message);
      };

      app.api.ws.onmessage = function(e) {
        var data, type;

        data = JSON.parse(e.data);
        type = data[1];

        switch (type) {
          case protocol.message.batch_history:
            model.history.apply(data[2], data[3], data[4], data[5]);
            break;
        }
      };
    } catch (e) {
      ws_repeater_factory();
    }
  };
  create_ws();

  window.onbeforeunload = function(e) {
    if (app.api.ws) {
      app.api.ws.close();
    }
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