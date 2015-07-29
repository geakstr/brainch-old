var utils = require('utils');

var normalize = exports.normalize = function(text) {
  return text.replace(/(\r\n|\n|\r)/gm, '');
};

var sanitize = exports.sanitize = function(text) {
  return text.deentitify();
};

var decorate = exports.decorate = function(text) {
  return text.replace(/big/g, '<span class="-date">big</span>');
};

var detect_type = exports.detect_type = function(text) {
  if (text.trim()[0] === '-') {
    return 'task';
  } else if (text.length === 0) {
    return 'empty';
  }

  return 'note';
};

var dom_block = exports.dom = function(text) {
  var container = document.createElement('p');

  var that = {
    get container() {
      return container;
    },

    get text() {
      return container.textContent || '';
    },

    set text(value) {
      var gag = utils.isFirefox() ? '\n' : '<br>';
      container.innerHTML = value.length === 0 ? gag : decorate(normalize(sanitize(value)));

      that.type = detect_type(that.text);
    },

    get i() {
      return container.getAttribute('data-i') || 0;
    },

    set i(value) {
      container.setAttribute('data-i', value);
    },

    get type() {
      if (container.classList.contains('task')) {
        return 'task';
      } else if (container.classList.contains('empty')) {
        return 'empty';
      }

      return 'note';
    },

    set type(type) {
      container.className = 'blck';
      container.classList.add(type);
    }
  };

  that.text = text || '';

  return that;
};

var node_block = exports.node = function(text) {
  var container = {};

  var that = {
    get container() {
      return container;
    },

    get text() {
      return container.text || '';
    },

    set text(value) {
      container.html = value.length === 0 ? '\n' : decorate(normalize(sanitize(value)));

      that.type = detect_type(that.text);
    },

    get i() {
      return container.i || 0;
    },

    set i(value) {
      container.i = value;
    },

    get type() {
      return container.type || 'note';
    },

    set type(type) {
      container.type = type;
    }
  };

  that.text = text || '';

  return that;
};

exports.instance = function(text) {
  return utils.isBrowser() ? dom_block(text) : node_block(text);
};