'use strict';

var block = require('common/editor/model/block');
var protocol = require('common/protocol');

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

    to_json: function() {
      return JSON.stringify(actions);
    },

    restore: function(direction) {
      var undo, redo;

      undo = function() {
        var i, action, redo_story, redo_actions;

        redo_actions = [];
        for (i = actions.length - 1; i >= 0; i -= 1) {
          action = actions[i];

          switch (action[0]) {
            case protocol.history.story.insert_block:
              model.remove(action[1]);
              redo_actions.push([protocol.history.story.remove_block, action[1], action[2]]);
              break;
            case protocol.history.story.insert_text:
              model.remove(model.get(action[1]), action[3], action[3] + action[2].length);
              redo_actions.push([protocol.history.story.remove_text, action[1], action[2], action[3]]);
              break;
            case protocol.history.story.remove_block:
              model.insert(action[1], block.factory(action[2]));
              redo_actions.push([protocol.history.story.insert_block, action[1], action[2]]);
              break;
            case protocol.history.story.remove_text:
              model.insert(model.get(action[1]), action[2], action[3]);
              redo_actions.push([protocol.history.story.insert_text, action[1], action[2], action[3]]);
              break;
          }
        }
        redo_story = module.exports(model);
        redo_story.actions = redo_actions;

        return redo_story;
      };

      redo = function() {
        var i, l, action;

        l = actions.length;
        for (i = 0; i < l; i += 1) {
          action = actions[i];

          switch (action[0]) {
            case protocol.history.story.insert_block:
              model.insert(action[1], block.factory(action[2]));
              break;
            case protocol.history.story.insert_text:
              model.insert(model.get(action[1]), action[2], action[3]);
              break;
            case protocol.history.story.remove_block:
              model.remove(action[1]);
              break;
            case protocol.history.story.remove_text:
              model.remove(model.get(action[1]), action[3], action[3] + action[2].length);
              break;
          }
        }

        return that;
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};