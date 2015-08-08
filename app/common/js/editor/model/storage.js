'use strict';

var utils = require('common/utils');

var app = require('common/app');

module.exports = function(container) {
  var blocks;

  container = container || app.editor.container;
  blocks = [];

  blocks.splice = function(start, count, b) {
    var insert, remove, deleted;

    insert = function() {
      container.insertBefore(b.container, container.childNodes[start]);
      return Array.prototype.splice.call(blocks, start, count, b);
    };

    remove = function() {
      var i, l, deleted, removed;

      deleted = Array.prototype.splice.call(blocks, start, count);
      for (i = 0, l = deleted.length; i < l; i += 1) {
        removed = deleted[i];
        if (container.contains(removed.container)) {
          container.removeChild(removed.container);
        }
      }

      return deleted;
    };

    deleted = utils.is.undef(b) ? remove() : insert();

    that.actualize();

    return deleted.map(function(removed) {
      return {
        i: removed.i,
        start: removed.start,
        text: removed.text
      };
    });
  };

  var that = {
    get blocks() {
      return blocks;
    },

    get text() {
      return app.editor.doc.getSnapshot();
    },

    get length() {
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
    },

    push: function(b) {
      blocks.push(b);
      that.actualize();
    },

    actualize: function() {
      var i, l;

      blocks[0].i = 0;
      blocks[0].start = 0;
      for (i = 1, l = blocks.length; i < l; i += 1) {
        blocks[i].i = i;
        blocks[i].start = blocks[i - 1].end + 1;
      }
    }
  };

  return that;
};