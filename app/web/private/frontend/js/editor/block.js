var utils = require('utils');

var normalize = exports.normalize = function(text) {
  return text.replace(/(\r\n|\n|\r)/gm, '');
};

var sanitize = exports.sanitize = function(text) {
  return text.deentitify();
};

var process = exports.process = function(text) {
  return text.replace(/big/g, '<span class="-date">big</span>');
};

exports.factory = function(spec) {
  var dom = document.createElement('p');

  var typify = function(text) {
    dom.className = 'blck';

    if (text.trim()[0] === '-') {
      dom.classList.add('task');
    } else if (text.length === 0) {
      dom.classList.add('empty');
    } else {
      dom.classList.add('note');
    }
  };

  var that = {
    get dom() {
      return dom;
    },

    get text() {
      return dom.textContent;
    },

    set text(value) {
      var gag = utils.isFirefox() ? '\n' : '<br>';
      dom.innerHTML = value.length === 0 ? gag : process(normalize(sanitize(value)));

      this.type = typify(this.text);
    },

    get i() {
      return dom.getAttribute('data-i') || 0;
    },

    set i(value) {
      dom.setAttribute('data-i', value);
    },

    get type() {
      if (dom.classList.contains('task')) {
        return 'task';
      } else if (dom.classList.contains('empty')) {
        return 'empty';
      } else {
        return 'note';
      }
    },

    get length() {
      return this.text.lenght;
    }
  };

  that.text = spec.text || '';
  that.i = spec.i || 0;

  return that;
};