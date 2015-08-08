'use strict';

var utils = require('common/utils');

var block_utils = require('./utils');
var block_types = require('./types');

module.exports = function(text) {
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
      container.innerHTML = block_utils.compose(x, utils.is.firefox() ? '\n' : '<br>');
      that.type = block_types.detect(that.text);
    },

    get i() {
      return +container.getAttribute('data-i') || 0;
    },

    set i(x) {
      container.setAttribute('data-i', x);
    },

    get type() {
      if (container.classList.contains(block_types.enum.TASK)) {
        return block_types.enum.TASK;
      } else if (container.classList.contains(block_types.enum.EMPTY)) {
        return block_types.enum.EMPTY;
      }
      return block_types.enum.NOTE;
    },

    set type(x) {
      container.className = 'block';
      container.classList.add(x);
    },

    normalize: function() {
      that.text = that.text;
      return that;
    }
  };

  that.text = text || '';

  return that;
};