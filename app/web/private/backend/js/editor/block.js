var block = require('common/editor/block');

module.exports = function(text) {
  var container = {};

  var that = {
    get container() {
      return container;
    },

    get text() {
      return container.text || '';
    },

    set text(x) {
      container.html = block.build(x, '\n');
      that.type = block.detect_type(that.text);
    },

    get i() {
      return container.i || 0;
    },

    set i(x) {
      container.i = x;
    },

    get type() {
      return container.type || 'note';
    },

    set type(x) {
      container.type = x;
    }
  };

  return that;
};