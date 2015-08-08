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

Number.isNaN = function(value) {
  return typeof value === 'number' && isNaN(value);
};

Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};

exports.clone = {
  assoc: function(o) {
    var r = Object.create(null);
    for (var p in o) {
      if (!o.hasOwnProperty || o.hasOwnProperty(p)) {
        r[p] = o[p];
      }
    }
    return r;
  },
  array: function(array) {
    return array.slice(0);
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
  args: function(x) {
    var args = Array.prototype.slice.apply(x);
    var arity = args.length;
    return {
      i: function(i) {
        return args[i];
      },
      get arity() {
        return arity;
      },
      get raw() {
        return args;
      }
    };
  },
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

exports.exceptions = {
  log: function(e) {
    console.log(e.name + ' : ' + e.message);
    console.log(e.stack);
  },
  'signature not supported': function() {
    return {
      name: 'TypeError',
      message: 'This function signature not supported'
    };
  },
  'editor selection error': function() {
    return {
      name: 'EditorError',
      message: 'Something wrong with selection'
    };
  }
};