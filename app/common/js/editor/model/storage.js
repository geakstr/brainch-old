'use strict';

var utils = require('common/utils');

module.exports = function(dom) {
  var blocks = [];

  blocks.splice = function(start, count, b) {
    var that, insert, remove, update_indices, deleted;

    that = this;

    insert = function() {
      if (dom && utils.is.browser()) {
        dom.insertBefore(b.container, dom.childNodes[start]);
      }
      return Array.prototype.splice.call(that, start, count, b);
    };

    remove = function() {
      var i, l, deleted, removed;

      deleted = Array.prototype.splice.call(that, start, count);

      if (dom && utils.is.browser()) {
        l = deleted.length;
        for (i = 0; i < l; i += 1) {
          removed = deleted[i];
          if (dom.contains(removed.container)) {
            dom.removeChild(removed.container);
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

    return deleted;
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
      if (dom && utils.is.browser()) {
        var old = that.get(i);
        if (dom.contains(old.container)) {
          dom.replaceChild(b.container, old.container);
        }
      }

      that.blocks[i] = b;
    }
  };

  return that;
};