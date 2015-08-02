var utils = require('common/utils');

module.exports = function(dom) {
  var blocks = [];

  blocks.splice = function(i, n, b) {
    var that = this;

    var insert = function() {
      if (dom && utils.is.browser()) {
        dom.insertBefore(b.container, dom.childNodes[i]);
      }
      return Array.prototype.splice.call(that, i, n, b);
    };

    var remove = function() {
      var removed = Array.prototype.splice.call(that, i, n);
      if (dom && utils.is.browser()) {
        removed.loop(function(x) {
          if (dom.contains(x.container)) {
            dom.removeChild(x.container);
          }
        });
      }

      return removed;
    };

    var update_indices = function() {
      that.loop(i, function(x, i) {
        x.i = i;
      });
    };

    var removed = utils.is.undef(b) ? remove() : insert();

    update_indices();

    return removed;
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

    set: function(i, block) {
      if (dom && utils.is.browser()) {
        var old = that.get(i);
        if (dom.contains(old.container)) {
          dom.replaceChild(block.container, old.container);
        }
      }

      that.blocks[i] = block;
    }
  };

  return that;
};