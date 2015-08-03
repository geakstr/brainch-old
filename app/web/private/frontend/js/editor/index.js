'use strict';

module.exports = function(container) {
  var that, model, state, events, ws;

  state = {
    dom: {
      html: {
        length: container.innerHTML.length
      }
    },
    events: {
      prevent: {
        default: false
      },
      was: {
        keydown: false,
        cut: false,
        paste: false,
        copy: false,
        clipboard: function() {
          return state.events.was.paste || state.events.was.cut || state.events.was.copy;
        }
      }
    },
    prev: {
      cancel: {
        story: false,
        batch: false
      },
      stop: {
        batch: false
      },
      was: {
        char: false
      },
      selection: null,
      char: null
    }
  };

  ws = new WebSocket('ws://localhost:8888');
  model = require('common/editor/model')(container);
  events = require('frontend/editor/actions/events')(model, state, ws);

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
    type = data.type;

    switch (type) {
      case 'history_batch':
        model.history.apply(data.type, data.stories);
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