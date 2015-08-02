'use strict';

var utils = require('common/utils');
var block_utils = require('common/editor/model/block').utils;

module.exports = function() {
  var container = document.createElement('p');

  var that = {
    get container() {
      return container;
    },

    set container(c) {
      container = c;
    },

    get html() {
      return container.innerHTML;
    },

    get text() {
      return container.textContent || '';
    },

    set text(x) {
      var gag = utils.is.firefox() ? '\n' : '<br>';
      container.innerHTML = block_utils.compose(x, gag);
      that.type = block_utils.type.detect(that.text);
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