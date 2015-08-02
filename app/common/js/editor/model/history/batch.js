'use strict';

var selection = require('common/editor/selection').factory();

module.exports = function(model, title, start_selection) {
  var stories = [];

  var end_selection;

  var that = {
    get title() {
      return title;
    },

    set end_selection(s) {
      end_selection = s;
    },

    get end_selection() {
      return end_selection || start_selection;
    },

    push: function(story) {
      stories.push(story);
    },

    restore: function(direction) {
      var undo = function() {
        stories.loop(true, function(story) {
          story.restore(direction);
        });
        selection.set(model.get(start_selection.start.i).container, start_selection.start.pos);
      };

      var redo = function() {
        stories.loop(function(story) {
          story.restore(direction);
        });
        selection.set(model.get(that.end_selection.start.i).container, that.end_selection.start.pos);
      };

      var ret = direction === -1 ? undo() : redo();

      return ret;
    }
  };

  return that;
};