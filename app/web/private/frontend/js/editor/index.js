'use strict';

var app = require('common/editor/state');
var protocol = require('common/protocol');

module.exports = function(container) {
  var that;

  app.editor.container = container;
  app.editor.model = require('common/editor/model')();
  app.editor.events = require('frontend/editor/actions/events')();

  require('frontend/networking/ws')(function() {
    var events;

    container.setAttribute('spellcheck', false);
    container.setAttribute('contenteditable', true);

    events = app.editor.events;
    container.onkeydown = events.keydown;
    container.onkeyup = events.keyup;
    container.onpaste = events.paste;
    container.oncut = events.cut;
    container.oncopy = events.copy;

    app.dom.html.length = container.innerHTML.length;
  }, function() {
    container.setAttribute('contenteditable', false);

    container.onkeydown = null;
    container.onkeyup = null;
    container.onpaste = null;
    container.oncut = null;
    container.oncopy = null;
  }, function(json) {
    var data, type;

    data = JSON.parse(json);
    type = data[1];

    switch (type) {
      case protocol.message.batch_history:
        app.editor.model.history.apply(data[2], data[3], data[4], data[5]);
        break;
    }
  }, function() {});

  that = {
    get model() {
      return app.editor.model;
    }
  };

  return that;
};