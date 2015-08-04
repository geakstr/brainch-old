'use strict';

var keys = require('common/keys_map');
var protocol = require('common/protocol');
var app = require('common/editor/state');
var selection = require('common/editor/selection').factory();

var config = require('frontend/configs');

module.exports = function() {
  var that, model;
  var stop_batch, resolve_batch;
  var need_stop_batch, need_cancel_batch;
  var batch_timer_factory, batch_timer;

  model = app.editor.model;

  batch_timer_factory = function() {
    clearInterval(batch_timer);
    batch_timer = setInterval(function() {
      stop_batch(selection.get(model));
    }, 1500);
  };
  batch_timer_factory();

  need_stop_batch = function(s) {
    return app.prev.selection !== null && app.prev.selection.start.i !== s.start.i;
  };

  need_cancel_batch = function(info) {
    return info.cancel_story && app.prev.cancel.story;
  };

  resolve_batch = function(info) {
    var s;

    selection.set(model.get(info.i).container, info.pos);

    s = selection.get(model);
    if (info.cancel_story) {
      model.history.record.cancel();
      if (need_cancel_batch(info)) {
        model.batch.cancel();
      } else {
        stop_batch(s);
      }
      app.prev.cancel.story = true;
    } else {
      model.history.record.stop();
      if (info.stop_batch || need_stop_batch(s)) {
        stop_batch(s);
      }
      app.prev.cancel.story = false;
    }
    app.prev.selection = s.clone();
  };

  stop_batch = function(s) {
    if (model.history.batch.stop(s).was_batching) {
      batch_timer_factory();
    }
  };

  that = {
    new_line: function(s) {
      model.history.batch.start(protocol.history.batch.new_line, s.clone());
      model.insert(s.clone(), '\n');
      model.history.record.stop();
      selection.set(model.get(s.start.i + 1).container, 0);
      stop_batch(selection.get(model));
    },

    delete: function(s) {
      model.history.batch.start(protocol.history.batch.delete, s.clone());
      resolve_batch(model.remove(s.clone(), keys.delete));
    },

    backspace: function(s) {
      model.history.batch.start(protocol.history.batch.backspace, s.clone());
      resolve_batch(model.remove(s.clone(), keys.backspace));
    },

    tab: function(s) {
      model.history.batch.start(protocol.history.batch.text, s.clone());
      model.insert(s.clone(), '\t');
      model.history.record.stop();
      selection.set(model.get(s.start.i).container, s.start.pos + 1);
      stop_batch(selection.get(model));
    },

    char_under_selection: function(s) {
      model.history.batch.start(protocol.history.batch.delete, s.clone());
      resolve_batch(model.remove(s.clone(), keys.delete));
    },

    just_char: function() {
      var s, c, store_char;

      if (app.events.was.clipboard()) {
        return;
      } else if (app.dom.html.length === model.container.innerHTML.length) {
        return;
      } else {
        app.dom.html.length = model.container.innerHTML.length;
      }

      s = selection.get(model);
      c = s.start.block.text.substring(s.start.pos - 1, s.start.pos);
      if (config.debug.on && config.debug.verbose) {
        console.log(c);
      }

      store_char = function() {
        var _s;

        _s = s.clone();
        _s.start.pos--;

        model.get(_s.start.i).normalize();

        model.history.batch.start(protocol.history.batch.text, _s);
        model.history.push([protocol.history.story.insert_text, _s.start.i, c, _s.start.pos]);
        model.history.record.stop();
        selection.set(model.get(s.start.i).container, s.start.pos);
      };

      if (need_stop_batch(s)) {
        stop_batch(app.prev.selection.clone());
        store_char();
      } else if (app.prev.char !== null && app.prev.char !== c) {
        if (app.prev.char !== ' ' && c === ' ') {
          store_char();
          stop_batch(selection.get(model));
        } else if (app.prev.char === ' ' && c !== ' ') {
          stop_batch(selection.get(model));
          store_char();
        } else {
          store_char();
          batch_timer_factory();
        }
      } else {
        store_char();
        batch_timer_factory();
      }

      app.prev.char = c;
      app.prev.selection = s.clone();
      app.prev.cancel.char = false;
    }
  };

  return that;
};