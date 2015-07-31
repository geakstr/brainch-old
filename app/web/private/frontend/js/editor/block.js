'use strict';

var utils = require('common/utils');
var block = require('common/editor/model/block');

module.exports = function() {
  var container = document.createElement('p');

  var that = {
    get container() {
      return container;
    },

    get html() {
      return container.innerHTML;
    },

    get text() {
      return container.textContent || '';
    },

    set text(x) {
      var gag = utils.is.firefox() ? '\n' : '<br>';
      container.innerHTML = block.utils.compose(x, gag);
      that.type = block.utils.type.detect(that.text);
    },

    get i() {
      return +container.getAttribute('data-i') || 0;
    },

    set i(x) {
      container.setAttribute('data-i', x);
    },

    get type() {
      if (container.classList.contains('task')) {
        return 'task';
      } else if (container.classList.contains('empty')) {
        return 'empty';
      }

      return 'note';
    },

    set type(x) {
      container.className = 'block';
      container.classList.add(x);
    }
  };

  return that;
};