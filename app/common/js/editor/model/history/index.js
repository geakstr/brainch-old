var story = require('common/editor/model/history/story');

module.exports = function(model) {
  var state = {
    i: 0,
    stories: [],
    recording: false,
    story: null
  };

  var restore = function(i, direction) {
    state.stories[i].restore(direction);
  };

  var persist = function() {
    state.stories.splice(state.i++, Number.MAX_VALUE, state.story);
  };

  var that = {
    push: function(action) {
      if (state.recording) {
        state.story.push(action);
      }
    },

    undo: function() {
      if (state.i === 0) {
        return;
      }
      restore(--state.i, -1);
    },

    redo: function() {
      if (state.i === state.stories.length) {
        return;
      }
      restore(state.i++, +1);
    },

    record: {
      start: function(title, selection) {
        state.recording = true;
        state.story = story(model, title, selection);
      },

      stop: function() {
        if (state.recording) {
          persist(state.story);
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