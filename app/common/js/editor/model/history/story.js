'use strict';

module.exports = function(model) {
  var that, actions;

  actions = [];

  that = {
    push: function(action) {
      actions.push(action);
    },

    restore: function(direction) {
      var undo, redo;

      undo = function() {
        var i, j, l, action, data, block;

        for (i = actions.length - 1; i >= 0; i -= 1) {
          action = actions[i];
          data = action.data;

          switch (action.name) {
            case 'insert.text':
              model.remove(model.get(data.i), data.pos, data.pos + data.text.length);
              break;
            case 'remove.text':
              model.insert(model.get(data.i), data.text, data.pos);
              break;
            case 'insert.block':
              model.remove(data.block.i);
              break;
            case 'remove.blocks':
              l = data.blocks.length;
              for (j = 0; j < l; j += 1) {
                block = data.blocks[j];
                model.insert(block.i, block);
              }
              break;
          }
        }
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
              model.insert(data.block.i, data.block);
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