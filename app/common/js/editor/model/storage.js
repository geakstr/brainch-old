'use strict';

var utils = require('common/utils');

var app = require('common/app');

module.exports = function() {
  var blocks, container;

  container = app.editor.container;
  blocks = [];

  blocks.splice = function(start, count, b) {
    var that, insert, remove, update_indices, deleted;

    that = this;

    insert = function() {
      if (container && utils.is.browser()) {
        container.insertBefore(b.container, container.childNodes[start]);
      }
      return Array.prototype.splice.call(that, start, count, b);
    };

    remove = function() {
      var i, l, deleted, removed;

      deleted = Array.prototype.splice.call(that, start, count);

      if (container && utils.is.browser()) {
        l = deleted.length;
        for (i = 0; i < l; i += 1) {
          removed = deleted[i];
          if (container.contains(removed.container)) {
            container.removeChild(removed.container);
          }
        }
      }

      return deleted;
    };

    update_indices = function() {
      var i, l;

      l = that.length;
      for (i = start; i < l; i += 1) {
        that[i].i = i;
      }
    };

    deleted = utils.is.undef(b) ? remove() : insert();

    update_indices();

    return deleted.map(function(removed) {
      return {
        i: removed.i,
        text: removed.text
      };
    });
  };

  var that = {
    get blocks() {
      return blocks;
    },

    size: function() {
      return that.blocks.length;
    },

    get: function(i) {
      return that.blocks[i];
    },

    set: function(i, b) {
      if (container && utils.is.browser()) {
        var old = that.get(i);
        if (container.contains(old.container)) {
          container.replaceChild(b.container, old.container);
        }
      }

      that.blocks[i] = b;
    }
  };

  return that;
};