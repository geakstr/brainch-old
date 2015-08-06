'use strict';

var utils = require('common/utils');

var block = require('common/editor/model/block');

module.exports = function() {
  var that, container, pos;

  container = document.createElement('p');

  that = {
    get container() {
      return container;
    },

    set container(c) {
      container = c;
    },

    get start() {
      return pos;
    },

    set start(x) {
      pos = x;
    },

    get end() {
      return pos + that.text.length;
    },

    get html() {
      return container.innerHTML;
    },

    get length() {
      return that.text.length;
    },

    get text() {
      return container.textContent || '';
    },

    set text(x) {
      container.innerHTML = block.utils.compose(x, utils.is.firefox() ? '\n' : '<br>');
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