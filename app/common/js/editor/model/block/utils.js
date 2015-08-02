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

  clone: function(block) {
    var cloned = require('./factory')();
    if (utils.is.browser()) {
      cloned.container = block.container.cloneNode(true);
    } else {
      cloned.text = block.text;
      cloned.i = block.i;
    }
    return cloned;
  },

  to_string: function(b) {
    var ret = '[Block]\n';
    ret += '\tIndex : ' + b.i + '\n';
    ret += '\tText : ' + b.text + '\n';
    ret += '\tType : ' + b.type + '\n';
    return ret;
  }
};