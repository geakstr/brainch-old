module.exports = function() {
  var state = {
    i: 0,
    stories: [],
    recording: false
  };

  var that = {
    add: function(story) {
      state.stories.splice(++state.i, Number.MAX_VALUE, story);
    },

    undo: function() {
      if (state.i > 0) {
        state.i--;
      }
    },

    redo: function() {
      if (state.i < state.stories.length - 1) {
        state.i++;
      }
    },

    record: {
      start: function() {
        state.recording = true;
      },

      stop: function() {
        state.recording = false;
      }
    }
  };

  return that;
};