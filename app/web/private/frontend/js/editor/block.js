var utils = require('common/utils');
var block = require('common/editor/block');

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
      container.innerHTML = block.build(x, utils.is.firefox() ? '\n' : '<br>');
      that.type = block.detect_type(that.text);
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