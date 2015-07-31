var config = require('frontend/configs');

module.exports = function(model) {
  var actions = [];

  var reverse = {
    'insert block': function(x) {
      if (config.debug.on && config.debug.events) {
        console.log('Restoring : reverse insert block');
      }

      return;
    },
    'remove blocks': function(x) {
      if (config.debug.on && config.debug.events) {
        console.log('Restoring : reverse remove blocks');
      }

      return;
    },
    'insert text': function(x) {
      if (config.debug.on && config.debug.events) {
        console.log('Restoring : reverse insert text');
      }

      return;
    },
    'remove text': function(x) {
      if (config.debug.on && config.debug.events) {
        console.log('Restoring : reverse remove text');
      }

      return;
    }
  };

  var that = {
    push: function(action) {
      return actions.push(action);
    },

    restore: function() {
      actions.loop(actions.length - 1, 0, function(x) {
        reverse[x.action.name](x.action.data);
      });
    }
  };

  return that;
};