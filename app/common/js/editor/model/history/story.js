module.exports = function(model, name, s) {
  var actions = [];

  var that = {
    push: function(action) {
      return actions.push(action);
    },

    restore: function(direction) {
      var undo = function() {
        actions.loop(actions.length - 1, 0, -1, function(action) {
          var data = action.data;
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
              data.blocks.loop(function(x) {
                model.insert(x.i, x);
              });
              break;
          }
        });
      };

      var redo = function() {
        actions.loop(function(action) {
          var data = action.data;
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
              data.blocks.loop(function(x) {
                model.remove(x.i);
              });
              break;
          }
        });
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};