'use strict';

var selection = require('common/editor/selection');
var utils = require('common/utils');
var protocol = require('common/protocol');

var app = require('common/app');
var story = require('common/editor/model/history/story');
var batch = require('common/editor/model/history/batch');
var block = require('common/editor/model/block').factory;

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
      var i, j, l, n, m, x, y, splited, retain;

      console.log(op);
      retain = 0;
      app.editor.ot.can_op = false;
      for (i = 0, l = op.length; i < l; i += 1) {
        x = op[i];

        if (utils.is.num(x)) {
          retain += x;
        } else if (utils.is.str(x)) {
          splited = x.split('\n');
          n = x.length;
          m = splited.length;
          if (m === 1) {
            app.editor.model.insert(retain, x);
            retain += n;
          } else {
            for (j = 0; j < m - 1; j += 1) {
              y = splited[j];
              app.editor.model.insert(retain, y);
              retain += y.length;
              app.editor.model.insert(retain, '\n');
              retain += 1;
            }
            if (x[n - 1] !== '\n') {
              y = splited[m - 1];
              app.editor.model.insert(retain, y);
              retain += y.length;
            }
          }

        } else {
          app.editor.model.remove(retain, x);
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