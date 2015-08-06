'use strict';

var selection = require('common/editor/selection');
var utils = require('common/utils');
var protocol = require('common/protocol');

var app = require('common/app');
var story = require('common/editor/model/history/story');
var batch = require('common/editor/model/history/batch');

module.exports = function() {
  var that, model, state, push_batch, restore_batch;

  model = null;

  state = {
    i: 0,
    batches: [],
    batch: null,
    story: null,
    batching: false,
    recording: false
  };

  restore_batch = function(i, direction, set_selection) {
    return state.batches[i].restore(direction, set_selection);
  };

  push_batch = function(new_batch) {
    state.batches.splice(state.i, Number.MAX_VALUE, new_batch);
  };

  that = {
    set model(_model) {
      model = _model;
    },

    get batching() {
      return state.batching;
    },

    push: function(action) {
      if (state.recording) {
        state.story.push(action);
      }
    },

    apply: function(op) {
      var i, l, x, s, cursor;

      cursor = 0;
      app.editor.ot.can_op = false;
      for (i = 0, l = op.length; i < l; i += 1) {
        x = op[i];

        s = Object.create(null);

        s.start = Object.create(null);
        s.start.block = model.get_by_cursor(cursor);
        s.start.i = s.start.block.i;
        s.start.text = s.start.block.text;
        s.start.pos = cursor - s.start.block.start;

        s.end = Object.create(null);
        s.end.block = model.get_by_cursor(cursor);
        s.end.i = s.end.block.i;
        s.end.text = s.end.block.text;
        s.end.pos = cursor - s.end.block.start;

        s.is = Object.create(null);
        s.is.range = s.start.pos !== s.end.pos;
        s.is.caret = s.start.i === s.end.i && s.start.pos === s.end.pos;

        s.clone = selection.clone;

        if (utils.is.num(x)) {
          cursor += x;
        } else if (utils.is.str(x)) {
          if (x === '\n') {
            app.editor.inputs.new_line(s);
          } else {
            app.editor.model.insert(s.start.block, x, s.start.pos);
          }
          //model.insert(model.get_by_cursor(cursor), x, cursor);
        } else {
          model.remove(model.get_by_cursor(cursor), cursor, x.d);
        }
      }
      app.editor.ot.can_op = true;
      console.log(app.editor.ot.doc.getSnapshot());
    },

    undo: function(selection) {
      that.batch.stop(selection);
      if (state.i === 0) {
        return;
      }
      restore_batch(--state.i, -1, true);
    },

    redo: function(selection) {
      that.batch.stop(selection);
      if (state.i === state.batches.length) {
        return;
      }
      restore_batch(state.i++, +1, true);
    },

    batch: {
      start: function(title, selection) {
        state.recording = true;
        state.story = story(model);
        if (state.batching && state.batch.title === protocol.history.batch[title]) {
          return;
        } else if (state.batching) {
          that.batch.stop(selection.clone());
        }
        state.batching = true;
        state.batch = batch(model, title, selection);
      },

      stop: function(selection) {
        var was_batching;

        was_batching = state.batching;
        if (state.batching) {
          state.batch.end_selection = selection;
          push_batch(state.batch);
          state.i += 1;
        }
        state.batching = false;

        return {
          was_batching: was_batching
        };
      },

      cancel: function() {
        state.batching = false;
        state.batch = null;
      }
    },

    record: {
      stop: function() {
        if (state.recording) {
          state.batch.push(state.story);
        }
        state.recording = false;
      },

      cancel: function() {
        state.recording = false;
        state.story = null;
      }
    }
  };

  return that;
};