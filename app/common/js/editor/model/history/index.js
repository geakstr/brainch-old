var story = require('./story');

module.exports = function(model) {
  var state = {
    i: 0,
    stories: [],
    recording: false,
    story: null
  };

  var persist = function(story) {
    state.stories.splice(++state.i, Number.MAX_VALUE, story);
  };

  var restore = function(i) {
    state.stories[i].restore();
  };

  var that = {
    push: function(action) {
      if (!state.recording) {
        return;
      }
      state.story.push(action);
    },

    undo: function() {
      that.record.cancel();
      if (state.i <= 0) {
        return;
      }
      restore(--state.i);
    },

    redo: function() {
      that.record.cancel();
      if (state.i >= state.stories.length - 1) {
        return;
      }
      restore(++state.i);
    },

    record: {
      on: function() {
        state.recording = true;
        state.story = story(model);
      },

      off: function() {
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