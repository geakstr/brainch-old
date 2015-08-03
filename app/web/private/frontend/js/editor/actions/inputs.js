'use strict';

var selection = require('common/editor/selection').factory();
var keys = require('common/keys_map');
var config = require('frontend/configs');

module.exports = function(model, state, ws) {
  var that, stop_batch, resolve_batch, need_stop_batch, need_cancel_batch;

  need_stop_batch = function(s) {
    return state.prev.selection !== null && state.prev.selection.start.i !== s.start.i;
  };

  need_cancel_batch = function(info) {
    return info.cancel_story && state.prev.cancel.story;
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
      state.prev.cancel.story = true;
    } else {
      model.history.record.stop();
      if (info.stop_batch || need_stop_batch(s)) {
        stop_batch(s);
      }
      state.prev.cancel.story = false;
    }
    state.prev.selection = s.clone();
  };

  stop_batch = function(s) {
    var batch;

    batch = model.history.batch.stop(s);

    if (batch.was_batching) {
      ws.send(batch.data.to_json());
    }
  };

  that = {
    new_line: function(s) {
      model.history.batch.start('new_line', s.clone());
      model.insert(s.clone(), '\n');
      model.history.record.stop();
      selection.set(model.get(s.start.i + 1).container, 0);
      stop_batch(selection.get(model));
    },

    delete: function(s) {
      model.history.batch.start('delete', s.clone());
      resolve_batch(model.remove(s.clone(), keys.delete));
    },

    backspace: function(s, batch_title) {
      model.history.batch.start(batch_title, s.clone());
      resolve_batch(model.remove(s.clone(), keys.backspace));
    },

    tab: function(s) {
      model.history.batch.start('tab', s.clone());
      model.insert(s.clone(), '\t');
      model.history.record.stop();
      selection.set(model.get(s.start.i).container, s.start.pos + 1);
      stop_batch(selection.get(model));
    },

    char_under_selection: function(s) {
      model.history.batch.start('char_under_selection', s.clone());
      resolve_batch(model.remove(s.clone(), keys.delete));
    },

    just_char: function() {
      var s, c, store_char;

      if (state.events.was.clipboard()) {
        return;
      } else if (state.dom.html.length === model.container.innerHTML.length) {
        return;
      } else {
        state.dom.html.length = model.container.innerHTML.length;
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

        model.history.batch.start('just_char', _s);
        model.history.push({
          name: 'insert.text',
          data: {
            i: _s.start.i,
            pos: _s.start.pos,
            text: c
          }
        });
        model.history.record.stop();
        selection.set(model.get(s.start.i).container, s.start.pos);
      };

      if (need_stop_batch(s)) {
        stop_batch(state.prev.selection.clone());
        store_char();
      } else if (state.prev.char !== null && state.prev.char !== c) {
        if (state.prev.char !== ' ' && c === ' ') {
          store_char();
          stop_batch(selection.get(model));
        } else if (state.prev.char === ' ' && c !== ' ') {
          stop_batch(selection.get(model));
          store_char();
        } else {
          store_char();
        }
      } else {
        store_char();
      }

      state.prev.char = c;
      state.prev.selection = s.clone();
    }
  };

  return that;
};