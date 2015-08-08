'use strict';

var app = require('frontend/app');
var selection = require('frontend/editor/selection');

module.exports = function() {
  var that;
  var stop_batch, resolve_batch;
  var need_stop_batch, need_cancel_batch;
  var batch_timer_factory, batch_timer;

  batch_timer_factory = function() {
    clearInterval(batch_timer);
    batch_timer = setInterval(function() {
      stop_batch(selection.get());
    }, 1500);
  };
  batch_timer_factory();

  need_stop_batch = function(s) {
    return app.editor.state.selection !== null && app.editor.state.selection.anchor_i !== s.anchor_i;
  };

  need_cancel_batch = function(info) {
    return info.cancel_story && app.editor.state.cancel.story;
  };

  resolve_batch = function(info) {
    var s;

    s = selection.get();
    if (info.cancel_story) {
      app.editor.history.record.cancel();
      if (need_cancel_batch(info)) {
        app.editor.model.batch.cancel();
      } else {
        stop_batch(s);
      }
      app.editor.state.cancel.story = true;
    } else {
      app.editor.model.history.record.stop();
      if (info.stop_batch || need_stop_batch(s)) {
        stop_batch(s);
      }
      app.editor.state.cancel.story = false;
    }
    app.editor.state.selection = s.clone();
  };

  stop_batch = function(s) {
    if (app.editor.history.batch.stop(s).was_batching) {
      batch_timer_factory();
    }
  };

  that = {
    new_line: function(s) {
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
      } else {
        app.editor.state.container.html.length = app.editor.container.innerHTML.length;
      }

      s = selection.get();
      b = app.editor.model.get_block_by_i(s.anchor_i);
      c = b.text.substring(s.anchor_p - 1, s.focus_p);

      store_char = function() {
        app.editor.model.storage.actualize();
        app.editor.ot.op([s.start - 1, c]);
        selection.set(b.normalize().container, s.anchor_p);
      };

      if (need_stop_batch(s)) {
        store_char();
      } else if (app.editor.state.char !== null && app.editor.state.char !== c) {
        if (app.editor.state.char !== ' ' && c === ' ') {
          store_char();
        } else if (app.editor.state.char === ' ' && c !== ' ') {
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
    }
  };

  return that;
};