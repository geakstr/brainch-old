'use strict';

var app = require('frontend/app');
var utils = require('frontend/utils');

module.exports = function() {
  var blocks;

  blocks = [];

  blocks.splice = function(start, count, b) {
    var insert, remove, deleted;

    insert = function() {
      app.editor.container.insertBefore(b.container, app.editor.container.childNodes[start]);
      return Array.prototype.splice.call(blocks, start, count, b);
    };

    remove = function() {
      var i, l, deleted, removed;

      deleted = Array.prototype.splice.call(blocks, start, count);
      for (i = 0, l = deleted.length; i < l; i += 1) {
        removed = deleted[i];
        if (app.editor.container.contains(removed.container)) {
          app.editor.container.removeChild(removed.container);
        }
      }

      return deleted;
    };

    deleted = utils.is.undef(b) ? remove() : insert();

    that.actualize();

    return deleted;
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
      if (app.editor.container && utils.is.browser()) {
        var old = that.get(i);
        if (app.editor.container.contains(old.container)) {
          app.editor.container.replaceChild(b.container, old.container);
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

      l = blocks.length;
      if (l === 0) {
        return;
      }

      blocks[0].i = 0;
      blocks[0].start = 0;
      for (i = 1; i < l; i += 1) {
        blocks[i].i = i;
        blocks[i].start = blocks[i - 1].end + 1;
      }
    }
  };

  return that;
};