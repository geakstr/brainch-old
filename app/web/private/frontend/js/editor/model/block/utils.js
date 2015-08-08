'use strict';

var utils = require('frontend/utils');

module.exports = {
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

  clone: function(b) {
    var cloned;

    cloned = require('./index')();
    if (utils.is.browser()) {
      cloned.container = b.container.cloneNode(true);
    } else {
      cloned.text = b.text;
      cloned.i = b.i;
    }
    return cloned;
  },

  to_string: function(b) {
    var ret;

    ret = '[Block]\n';
    ret += '\tIndex : ' + b.i + '\n';
    ret += '\tText : ' + b.text + '\n';
    ret += '\tType : ' + b.type + '\n';

    return ret;
  }
};