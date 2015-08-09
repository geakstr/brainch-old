'use strict';

var block_types = require('frontend/editor/model/block/types');
var block_utils = require('frontend/editor/model/block/utils');
var utils = require('frontend/utils');

module.exports = function(text) {
  var that, container, start;

  container = document.createElement('p');

  that = {
    get container() {
      return container;
    },

    set container(c) {
      container = c;
    },

    get start() {
      return start;
    },

    set start(x) {
      start = x;
    },

    get end() {
      return start + that.text.length;
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