'use strict';

var story = require('common/editor/model/history/story');
var batch = require('common/editor/model/history/batch');

module.exports = function(ws) {
  var that, model, state, restore;

  model = null;

  state = {
    i: 0,
    batches: [],
    batch: null,
    story: null,
    batching: false,
    recording: false
  };

  restore = function(i, direction, set_selection) {
    return state.batches[i].restore(direction, set_selection);
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

    undo: function(selection) {
      that.batch.stop(selection);
      if (state.i === 0) {
        return;
      }
      ws.send(restore(--state.i, -1, true).to_json());
    },

    redo: function(selection) {
      that.batch.stop(selection);
      if (state.i === state.batches.length) {
        return;
      }
      ws.send(restore(state.i++, +1, true).to_json());
    },

    apply: function(title, raw_stories) {
      that.record.stop();
      that.batch.stop();

      state.batch = batch(model, title);
      state.batch.stories = raw_stories.map(function(cur_story) {
        var new_story = story(model);

        cur_story.forEach(function(cur_action) {
          new_story.push(cur_action);
        });

        return new_story;
      });

      state.batches.splice(state.i, Number.MAX_VALUE, state.batch);

      restore(state.i++, +1, false);
    },

    batch: {
      start: function(title, selection) {
        state.recording = true;
        state.story = story(model);
        if (state.batching && state.batch.title === title) {
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
          state.batches.splice(state.i++, Number.MAX_VALUE, state.batch);
          ws.send(state.batch.to_json());
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