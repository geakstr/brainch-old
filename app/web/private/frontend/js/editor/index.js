'use strict';

module.exports = function(container) {
  var that, model, state, events;

  container.setAttribute('spellcheck', false);
  container.setAttribute('contenteditable', true);

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
      selection: null,
      char: null
    }
  };

  model = require('common/editor/model')(container);
  events = require('frontend/editor/actions/events')(model, state);

  container.onkeydown = events.keydown;
  container.onkeyup = events.keyup;
  container.onpaste = events.paste;
  container.oncut = events.cut;
  container.oncopy = events.copy;

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