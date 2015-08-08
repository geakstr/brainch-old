'use strict';

var utils = require('frontend/utils');
var selection = require('frontend/editor/selection');

module.exports = function(model, title, start_selection) {
  var that, stories, end_selection, compress;

  stories = [];

  that = {
    get stories() {
      return stories;
    },

    get length() {
      return stories.length;
    },

    set stories(x) {
      stories = x;
    },

    set end_selection(s) {
      end_selection = s;
    },

    get end_selection() {
      return end_selection || start_selection;
    },

    push: function(story) {
      if (!compress(story)) {
        stories.push(story);
      }
    },

    restore: function(direction, set_selection) {
      var undo, redo;

      undo = function() {
        var i, redo_batch, redo_stories;

        redo_stories = [];
        for (i = stories.length - 1; i >= 0; i -= 1) {
          redo_stories.push(stories[i].restore(direction));
        }
        redo_batch = module.exports(model, title, start_selection);
        redo_batch.stories = redo_stories;

        if (set_selection && !utils.is.undef(start_selection)) {
          selection.set(model.get(start_selection.start.i).container, start_selection.start.pos);
        }

        return redo_batch;
      };

      redo = function() {
        var i, l;

        l = stories.length;
        for (i = 0; i < l; i += 1) {
          stories[i].restore(direction);
        }

        if (set_selection && !utils.is.undef(end_selection)) {
          selection.set(model.get(that.end_selection.start.i).container, that.end_selection.start.pos);
        }

        return that;
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};