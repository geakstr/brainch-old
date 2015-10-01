'use strict';

var utils = require('brainch-frontend/utils');

var block_utils = exports.utils = {
  normalize: function(x) {
    return x.replace(/(\r\n|\n|\r)/gm, '');
  },

  sanitize: function(x) {
    return x.entitify();
  },

  decorate: function(x) {
    return x.replace(/big/g, '<span class="-date">big</span>');
  },

  compose: function(x) {
    return x.length === 0 ? '<br>' : this.decorate(this.sanitize(this.normalize(x)));
  },

  detect_type: function(x) {
    if (x.trim()[0] === '-') {
      return 'task';
    } else if (x.length === 0) {
      return 'empty';
    }
    return 'note';
  },

  clone: function(b) {
    var cloned;

    cloned = require('./index')();
    cloned.container = b.container.cloneNode(true);

    return cloned;
  }
};

exports.factory = function(text) {
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
      return start + that.length;
    },

    get length() {
      return that.text.length;
    },

    get text() {
      return container.textContent || '';
    },

    set text(x) {
      container.innerHTML = block_utils.compose(x);
      that.type = block_utils.detect_type(that.text);
    },

    get i() {
      return +utils.dom.node.data.get(container, 'i') || 0;
    },

    set i(x) {
      utils.dom.node.data.set(container, 'i', x);
    },

    get type() {
      if (utils.dom.node.has.class(container, 'task')) {
        return 'task';
      } else if (utils.dom.node.has.class(container, 'empty')) {
        return 'empty';
      }
      return 'note';
    },

    set type(x) {
      container.className = 'block';
      utils.dom.node.add.class(container, x);
    },

    normalize: function() {
      that.text = that.text;
      return that;
    },

    to_string: function() {
      var ret;

      ret = '[Block]\n';
      ret += '\tIndex : ' + that.i + '\n';
      ret += '\tText : ' + that.text + '\n';
      ret += '\tType : ' + that.type + '\n';
      ret += '\tStart : ' + that.start + '\n';
      ret += '\tEnd : ' + that.end;

      return ret;
    }
  };

  that.text = text || '';

  return that;
};
