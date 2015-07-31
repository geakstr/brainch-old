var utils = require('common/utils');
module.exports = {
  type: require('./type'),

  normalize: function(x) {
    return x.replace(/(\r\n|\n|\r)/gm, '');
  },

  sanitize: function(x) {
    return x.entitify();
  },

  decorate: function(x) {
    return x.replace(/big/g, '<span class="-date">big</span>');
  },

  compose: function(x, r) {
    return x.length === 0 ? r : this.decorate(this.sanitize(this.normalize(x)));
  },

  storage: function(dom) {
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

    return blocks;
  }
};