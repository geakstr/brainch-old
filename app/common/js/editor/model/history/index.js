'use strict';

var selection = require('common/editor/selection').factory();
var protocol = require('common/protocol');

var app = require('common/app');
var story = require('common/editor/model/history/story');
var batch = require('common/editor/model/history/batch');

module.exports = function() {
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
      app.api.ws.send(restore(--state.i, -1, true).to_json());
    },

    redo: function(selection) {
      that.batch.stop(selection);
      if (state.i === state.batches.length) {
        return;
      }
      app.api.ws.send(restore(state.i++, +1, true).to_json());
    },

    apply: function(id, title, selections, raw_stories) {
      var s, start_selection, end_selection;

      s = selection.get(model);

      start_selection = Object.create(null);
      start_selection.start = Object.create(null);
      start_selection.start.i = selections[0];
      start_selection.start.pos = selections[1];

      end_selection = Object.create(null);
      end_selection.start = Object.create(null);
      end_selection.start.i = selections[2];
      end_selection.start.pos = selections[3];

      that.record.stop();
      that.batch.stop();

      state.batch = batch(model, title, start_selection);
      state.batch.end_selection = end_selection;

      state.batch.stories = raw_stories.map(function(cur_story) {
        var new_story = story(model);

        cur_story.forEach(function(cur_action) {
          new_story.push(cur_action);
        });

        return new_story;
      });

      state.batches.splice(state.i, Number.MAX_VALUE, state.batch);
      app.editor.state.model.history.batch.offset++;

      restore(state.i++, +1, false);

      if (s !== null) {
        try {
          selection.set(s.start.block.container, s.start.pos);
        } catch (e) {
          try {
            selection.set(model.get(s.start.i).container, s.start.pos);
          } catch (e) {
            throw e;
          }
        }
      }
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
          state.batches.splice(state.i++, Number.MAX_VALUE, state.batch);
          app.editor.state.model.history.batch.offset++;
          app.api.ws.send(state.batch.to_json());
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