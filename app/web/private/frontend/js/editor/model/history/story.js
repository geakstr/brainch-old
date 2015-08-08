'use strict';

var block = require('frontend/editor/model/block');

module.exports = function(model) {
  var that, actions;

  actions = [];

  that = {
    get actions() {
      return actions;
    },

    set actions(x) {
      actions = x;
    },

    get length() {
      return actions.length;
    },

    push: function(action) {
      actions.push(action);
    },

    restore: function(direction) {
      var undo, redo;

      undo = function() {
        var i, action, redo_story, redo_actions;

        redo_actions = [];
        for (i = actions.length - 1; i >= 0; i -= 1) {
          action = actions[i];
        }
        redo_story = module.exports(model);
        redo_story.actions = redo_actions;

        return redo_story;
      };

      redo = function() {
        var i, l, action;

        for (i = 0, l = actions.length; i < l; i += 1) {
          action = actions[i];

        }

        return that;
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};