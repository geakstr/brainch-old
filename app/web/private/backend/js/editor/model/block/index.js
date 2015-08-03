'use strict';

var block = require('common/editor/model/block');

module.exports = function(text) {
  var that, container;

  container = {};

  that = {
    get container() {
      return container;
    },

    get text() {
      return container.text || '';
    },

    set text(x) {
      container.html = block.utils.compose(x, '\n');
      that.type = block.utils.type.detect(that.text);
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