'use strict';

var app = require('frontend/app');
var batch = require('frontend/editor/model/history/batch');
var story = require('frontend/editor/model/history/story');
var utils = require('frontend/utils');

module.exports = function() {
  var that, state, push_batch, restore_batch;

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
    get batching() {
      return state.batching;
    },

    push: function(action) {
      if (state.recording) {
        state.story.push(action);
      }
    },

    apply: function(op) {
      var i, l, x, retain;

      retain = 0;
      app.editor.ot.can_op = false;
      for (i = 0, l = op.length; i < l; i += 1) {
        x = op[i];
        if (utils.is.num(x)) {
          retain += x;
        } else if (utils.is.str(x)) {
          app.editor.model.insert_text(retain, x);
          retain += x.length;
        } else {
          app.editor.model.remove_text(retain, x.d);
        }
      }
      app.editor.ot.can_op = true;
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
        state.story = story();
        if (state.batching) {
          that.batch.stop(selection.clone());
        }
        state.batching = true;
        state.batch = batch(title, selection);
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