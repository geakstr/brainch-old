'use strict';

Function.prototype.method = function(name, f) {
  this.prototype[name] = f;
  return this;
};

String.method('entitify', (function() {
  return function() {
    return this.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
})());

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  };
}

exports.swap = function(x) {
  return x;
};

var dom = exports.dom = {
  node: {
    has: {
      class: function(node, cls) {
        return (' ' + node.className + ' ').indexOf(' ' + cls + ' ') > -1;
      }
    },
    add: {
      class: function(node, cls) {
        if (dom.node.has.class(node, cls)) {
          return;
        }
        node.className += ' ' + cls;
      }
    },
    get: {
      data: function(node, data_name) {
        return node.getAttribute('data-' + data_name);
      },
      attr: function(node, attr) {
        return node.getAttribute(attr);
      }
    }
  }
};

exports.is = {
  undef: function(x) {
    return typeof x === 'undefined';
  },

  obj: function(x) {
    return x !== null && !this.arr(x) && x === Object(x);
  },

  num: function(x) {
    return Object.prototype.toString.call(x) === '[object Number]' && isFinite(x);
  },

  nan: function(x) {
    return typeof x === 'number' && isNaN(x);
  },

  str: function(x) {
    return Object.prototype.toString.call(x) === '[object String]';
  },

  arr: function(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  },

  fun: function(x) {
    return Object.prototype.toString.call(x) === '[object Function]';
  },

  bool: function(x) {
    return Object.prototype.toString.call(x) === '[object Boolean]';
  },

  int: function(x) {
    return exports.is.num(x) && Math.floor(x) === x;
  },

  browser: function() {
    return window ? true : false;
  },

  node: function() {
    return process ? true : false;
  },

  firefox: function() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  },

  os: {
    mac: navigator.platform.toLowerCase().indexOf('mac') !== -1,
    windows: navigator.platform.toLowerCase().indexOf('win') !== -1,
    linux: navigator.platform.toLowerCase().indexOf('linux') !== -1
  }
};

exports.wrap = {
  event: function(event) {
    return {
      orig: event,
      key: event.keyCode || event.which,
      char: String.fromCharCode(event.keyCode),
      alt: event.altKey,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
      prevent: {
        default: function() {
          event.preventDefault();
        }
      },
      clipboard: {
        get: {
          text: function() {
            return event.clipboardData.getData('text/plain');
          }
        },
        set: {
          text: function(x) {
            return event.clipboardData.setData('text/plain', x);
          }
        }
      }
    };
  }
};

exports.key_codes = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  pausebreak: 19,
  capslock: 20,
  escape: 27,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  insert: 45,
  delete: 46,
  leftwindowkey: 91,
  rightwindowkey: 92,
  selectkey: 93,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  numlock: 144,
  scrolllock: 145
};