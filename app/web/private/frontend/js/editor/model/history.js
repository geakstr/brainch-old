'use strict';

var app = require('frontend/app');
var utils = require('frontend/utils');

module.exports = function() {
  var that, state;

  state = {
    i: 0,
    batches: [],
    batch: null,
    story: null,
    batching: false,
    recording: false
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

      app.editor.ot.can_op = false;
      for (i = 0, retain = 0, l = op.length; i < l; i += 1) {
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
    },

    inverse_op: function(op) {

    },

    undo: function() {
      var stories, actions, action, n, m, i, j;

      that.batch.stop();
      if (state.i === 0) {
        return;
      }

      stories = state.batches[--state.i];
      for (i = stories.length - 1; i >= 0; i -= 1) {
        actions = stories[i];
        for (j = actions.length - 1; j >= 0; j -= 1) {
          action = actions[j];

          console.log(action);
        }
      }
    },

    redo: function() {
      var restored_batch;

      that.batch.stop();
      if (state.i === state.batches.length) {
        return;
      }

      restored_batch = state.batches[state.i++];
    },

    batch: {
      start: function(id) {
        state.recording = true;
        state.story = [];
        if (state.batching && state.batch.id === id) {
          return;
        } else if (state.batching) {
          that.batch.stop();
        }
        state.batching = true;
        state.batch = [];
        state.batch.id = id;
      },

      stop: function() {
        var was_batching;

        was_batching = state.batching;
        if (state.batching) {
          state.batches.splice(state.i++, Number.MAX_VALUE, state.batch);
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