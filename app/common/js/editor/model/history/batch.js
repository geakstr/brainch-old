'use strict';

var selection = require('common/editor/selection').factory();

module.exports = function(model, title, start_selection) {
  var that, stories, end_selection;

  stories = [];

  that = {
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
      var undo, redo;

      undo = function() {
        var i;

        for (i = stories.length - 1; i >= 0; i -= 1) {
          stories[i].restore(direction);
        }

        selection.set(model.get(start_selection.start.i).container, start_selection.start.pos);
      };

      redo = function() {
        var i, l;

        l = stories.length;
        for (i = 0; i < l; i += 1) {
          stories[i].restore(direction);
        }

        selection.set(model.get(that.end_selection.start.i).container, that.end_selection.start.pos);
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};