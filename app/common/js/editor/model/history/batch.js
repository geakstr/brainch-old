var selection = require('common/editor/selection').factory();

module.exports = function(model, title, s) {
  var stories = [];

  var that = {
    get title() {
      return title;
    },

    push: function(story) {
      stories.push(story);
    },

    restore: function(direction) {
      var undo = function() {
        stories.loop(stories.length - 1, 0, -1, function(story) {
          story.restore(direction);
        });
      };

      var redo = function() {
        stories.loop(function(story) {
          story.restore(direction);
        });
      };

      var ret = direction === -1 ? undo() : redo();

      selection.set(model.get(s.start.i).container, s.start.pos);

      return ret;
    }
  };

  return that;
};