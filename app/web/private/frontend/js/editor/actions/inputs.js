'use strict';

var app = require('brainch-frontend/app');
var selection = require('brainch-frontend/editor/selection');

module.exports = function() {
  var that;
  var stop_batch, need_stop_batch;
  var batch_timer_factory, batch_timer;

  batch_timer_factory = function() {
    clearInterval(batch_timer);
    batch_timer = setInterval(function() {
      stop_batch();
    }, 1500);
  };
  batch_timer_factory();

  need_stop_batch = function(s) {
    return app.editor.state.selection !== null && app.editor.state.selection.anchor_i !== s.anchor_i;
  };

  stop_batch = function(s) {
    if (app.editor.history.batch.stop().was_batching) {
      batch_timer_factory();
    }
  };

  that = {
    new_line: function(s) {
      app.editor.model.remove_text(s.start, s.n);
      app.editor.model.insert_text(s.start, '\n');
      selection.set(app.editor.model.get_block_by_i(s.anchor_i + 1).container, 0);
    },

    delete: function(s) {
      // app.editor.model.remove_text(s.start, s.n);
    },

    backspace: function(s) {
      var was, orig_b, cur_b, prev_l, caret_p;

      if (s.n === 0 && s.start === 0) {
        return;
      }

      prev_l = 0;
      orig_b = app.editor.model.get_block_by_retain(s.start);
      if (s.n === 0) {
        s.start -= 1;
        s.n = 1;
        was = true;

        if (s.anchor_p === 0) {
          prev_l = app.editor.model.get_block_by_i(orig_b.i - 1).length;
        }
      }

      app.editor.model.remove_text(s.start, s.n);
      cur_b = app.editor.model.get_block_by_retain(s.start);

      caret_p = s.anchor_p - (was ? 1 : 0);
      if (orig_b.i > cur_b.i) {
        caret_p = prev_l;
      }

      selection.set(cur_b.container, caret_p);
    },

    tab: function(s) {
      app.editor.model.remove_text(s.start, s.n);
      app.editor.model.insert_text(s.start, '\t');
      selection.set(app.editor.model.get_block_by_i(s.anchor_i).container, s.anchor_p + 1);
    },

    char_under_selection: function(s) {
      app.editor.model.remove_text(s.start, s.n);
      selection.set(app.editor.model.get_block_by_i(s.anchor_i).container, s.anchor_p);
    },

    just_char: function() {
      var s, b, c, store_char;

      if (app.editor.state.events.clipboard()) {
        return;
      } else if (app.editor.state.container.html.length === app.editor.container.innerHTML.length) {
        return;
      }

      s = selection.get();
      b = app.editor.model.get_block_by_i(s.anchor_i).normalize();
      c = b.text.substring(s.anchor_p - 1, s.focus_p);

      store_char = function() {
        app.editor.model.storage.actualize();

        app.editor.history.batch.start('char');
        app.editor.history.push([s.start - 1, c]);
        app.editor.history.record.stop();

        app.editor.ot.op([s.start - 1, c]);
        selection.set(b.container, s.anchor_p);
      };

      if (need_stop_batch(s)) {
        stop_batch();
        store_char();
      } else if (app.editor.state.char !== null && app.editor.state.char !== c) {
        if (app.editor.state.char !== ' ' && c === ' ') {
          store_char();
          stop_batch();
        } else if (app.editor.state.char === ' ' && c !== ' ') {
          stop_batch();
          store_char();
        } else {
          store_char();
          batch_timer_factory();
        }
      } else {
        store_char();
        batch_timer_factory();
      }

      app.editor.state.char = c;
      app.editor.state.selection = selection.clone(s);
      app.editor.state.cancel.char = false;
      app.editor.state.container.html.length = app.editor.container.innerHTML.length;
    }
  };

  return that;
};
