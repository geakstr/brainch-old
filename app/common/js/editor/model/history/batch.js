'use strict';

var selection = require('common/editor/selection').factory();

module.exports = function(model, title, start_selection) {
  var that, stories, end_selection;

  stories = [];

  that = {
    get title() {
      return title;
    },

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

    to_json: function() {
      var json;

      json = {
        type: 'history_batch',
        title: title,
        stories: stories.map(function(story) {
          return story.actions;
        })
      };

      return JSON.stringify(json);
    },

    push: function(story) {
      stories.push(story);
    },

    restore: function(direction, set_selection) {
      var undo, redo;

      undo = function() {
        var i, undo_batch, undo_stories;

        undo_stories = [];
        for (i = stories.length - 1; i >= 0; i -= 1) {
          undo_stories.push(stories[i].restore(direction));
        }
        undo_batch = module.exports(model, title, start_selection);
        undo_batch.stories = undo_stories;

        if (set_selection) {
          selection.set(model.get(start_selection.start.i).container, start_selection.start.pos);
        }

        return undo_batch;
      };

      redo = function() {
        var i, l;

        l = stories.length;
        for (i = 0; i < l; i += 1) {
          stories[i].restore(direction);
        }

        if (set_selection) {
          selection.set(model.get(that.end_selection.start.i).container, that.end_selection.start.pos);
        }
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};