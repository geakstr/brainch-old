var story = require('common/editor/model/history/story');
var batch = require('common/editor/model/history/batch');

module.exports = function() {
  var model = null;

  var state = {
    i: 0,
    batches: [],
    batch: [],
    story: null,
    batching: false,
    recording: false
  };

  var restore = function(i, direction) {
    state.batches[i].restore(direction);
  };

  var that = {
    set model(_model) {
      model = _model;
    },

    push: function(action) {
      if (state.recording) {
        state.story.push(action);
      }
    },

    undo: function(selection) {
      that.batch.stop(selection);
      if (state.i === 0) {
        return;
      }
      restore(--state.i, -1);
    },

    redo: function(selection) {
      that.batch.stop(selection);
      if (state.i === state.batches.length) {
        return;
      }
      restore(state.i++, +1);
    },

    batch: {
      start: function(title, selection) {
        if (state.batching && state.batch.title === title) {
          return;
        } else if (state.batching) {
          that.batch.stop(selection.clone());
        }
        state.batching = true;
        state.batch = batch(model, title, selection);
      },

      stop: function(selection) {
        if (state.batching) {
          state.batch.end_selection = selection;
          state.batches.splice(state.i++, Number.MAX_VALUE, state.batch);
        }
        state.batching = false;
      },

      cancel: function() {
        state.batching = false;
        state.batch = null;
      }
    },

    record: {
      start: function() {
        state.recording = true;
        state.story = story(model);
      },

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