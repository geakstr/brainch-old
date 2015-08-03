'use strict';

var block = require('common/editor/model/block');

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
        var i, j, l, action, data, b, undo_story, undo_actions;

        undo_actions = [];
        for (i = actions.length - 1; i >= 0; i -= 1) {
          action = actions[i];
          data = action.data;

          switch (action.name) {
            case 'insert.text':
              model.remove(model.get(data.i), data.pos, data.pos + data.text.length);
              undo_actions.push({
                name: 'remove.text',
                data: {
                  i: data.i,
                  pos: data.pos,
                  text: data.text
                }
              });
              break;
            case 'remove.text':
              model.insert(model.get(data.i), data.text, data.pos);
              undo_actions.push({
                name: 'insert.text',
                data: {
                  i: data.i,
                  pos: data.pos,
                  text: data.text
                }
              });
              break;
            case 'insert.block':
              model.remove(data.i);
              undo_actions.push({
                name: 'remove.blocks',
                data: {
                  blocks: [{
                    i: data.i,
                    text: data.text
                  }]
                }
              });
              break;
            case 'remove.blocks':
              l = data.blocks.length;
              for (j = 0; j < l; j += 1) {
                b = data.blocks[j];
                model.insert(b.i, block.factory(b.text));
                undo_actions.push({
                  name: 'insert.block',
                  data: {
                    i: b.i,
                    text: b.text
                  }
                });
              }
              break;
          }
        }
        undo_story = module.exports(model);
        undo_story.actions = undo_actions;

        return undo_story;
      };

      redo = function() {
        var i, j, l, action, data;

        l = actions.length;
        for (i = 0; i < l; i += 1) {
          action = actions[i];
          data = action.data;

          switch (action.name) {
            case 'insert.text':
              model.insert(model.get(data.i), data.text, data.pos);
              break;
            case 'remove.text':
              model.remove(model.get(data.i), data.pos, data.pos + data.text.length);
              break;
            case 'insert.block':
              model.insert(data.i, block.factory(data.text));
              break;
            case 'remove.blocks':
              for (j = data.blocks.length - 1; j >= 0; j -= 1) {
                model.remove(data.blocks[j].i);
              }
              break;
          }
        }
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};