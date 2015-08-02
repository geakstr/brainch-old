'use strict';

Function.prototype.method = function(name, f) {
  this.prototype[name] = f;
  return this;
};

String.method('entitify', function() {
  return function() {
    return this.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
}());

Number.isNaN = Number.isNaN || function(value) {
  return typeof value === 'number' && isNaN(value);
};


/**
 * Wrapper for loop
 *
 * Possible usages:
 *
 * arr.loop(start, stop, step, callback, context, checker);
 * arr.loop(start, stop, step, callback, context);
 * arr.loop(start, stop, step, callback, checker);
 * arr.loop(start, stop, step, callback);
 * arr.loop(start, stop, callback, context);
 * arr.loop(start, stop, callback, checker);
 * arr.loop(start, stop, callback);
 * arr.loop(start, callback, context);
 * arr.loop(start, callback, checker);
 * arr.loop(start, callback);
 * arr.loop(callback, context);
 * arr.loop(callback, checker);
 * arr.loop(callback);
 *
 * Procedure can be called with variable args set
 * @param {Number}    start       Iterate from this index (inclusive); 0 by default
 * @param {Number}    stop        Iterate to this index (inclusive); arr.length - 1 by default
 * @param {Number}    step        Iteration step (positive or negative); 1 by default
 * @param {Function}  callback    Callback function which call with
 *                                cur element and index params on each iteration
 * @param {Object}    context     Context object for callback function; array context by default
 * @param {Function}  checker     Check function which call with
 *                                start, stop and step params on each iteration
 * @return {void}
 */
Array.method('loop', function() {
  return function() {
    var args = Array.prototype.slice.apply(arguments);

    if (args.length === 0) {
      throw {
        name: 'TypeError',
        message: 'This method signature not supported'
      };
    }

    var start = 0;
    var stop = this.length - 1;
    var step = 1;
    var callback;
    var context;
    var checker;

    if (args.length === 6) {
      if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'number' &&
        typeof args[3] === 'function' &&
        typeof args[4] === 'object' &&
        typeof args[5] === 'function') {
        start = args[0];
        stop = args[1];
        step = args[2];
        callback = args[3];
        context = args[4];
        checker = args[5];
      }
    } else if (args.length === 5) {
      if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'number' &&
        typeof args[3] === 'function' &&
        typeof args[4] === 'object') {
        start = args[0];
        stop = args[1];
        step = args[2];
        callback = args[3];
        context = args[4];
      } else if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'number' &&
        typeof args[3] === 'function' &&
        typeof args[4] === 'function') {
        start = args[0];
        stop = args[1];
        step = args[2];
        callback = args[3];
        checker = args[4];
      }
    } else if (args.length === 4) {
      if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'number' &&
        typeof args[3] === 'function') {
        start = args[0];
        stop = args[1];
        step = args[2];
        callback = args[3];
      } else if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'function' &&
        typeof args[3] === 'object') {
        start = args[0];
        stop = args[1];
        callback = args[2];
        context = args[3];
      } else if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'function' &&
        typeof args[3] === 'function') {
        start = args[0];
        stop = args[1];
        callback = args[2];
        checker = args[3];
      }
    } else if (args.length === 3) {
      if (typeof args[0] === 'number' &&
        typeof args[1] === 'number' &&
        typeof args[2] === 'function') {
        start = args[0];
        stop = args[1];
        callback = args[2];
      } else if (typeof args[0] === 'number' &&
        typeof args[1] === 'function' &&
        typeof args[2] === 'object') {
        start = args[0];
        callback = args[1];
        context = args[2];
      } else if (typeof args[0] === 'number' &&
        typeof args[1] === 'function' &&
        typeof args[2] === 'function') {
        start = args[0];
        callback = args[1];
        checker = args[2];
      }
    } else if (args.length === 2) {
      if (typeof args[0] === 'number' &&
        typeof args[1] === 'function') {
        start = args[0];
        callback = args[1];
      } else if (typeof args[0] === 'function' &&
        typeof args[1] === 'object') {
        callback = args[0];
        context = args[1];
      } else if (typeof args[0] === 'function' &&
        typeof args[1] === 'function') {
        callback = args[0];
        checker = args[1];
      }
    } else if (args.length === 1) {
      if (typeof args[0] === 'function') {
        callback = args[0];
      }
    } else {
      throw {
        name: 'TypeError',
        message: 'This method signature not supported'
      };
    }

    if ((step > 0 && start > stop) || (step < 0 && start < stop)) {
      return;
    }

    context = context || this;

    var i;
    for (i = start; step > 0 ? i <= stop : i >= stop; i += step) {
      var x = this[i];
      if (typeof checker === 'undefined' || checker(x, i, start, stop, step)) {
        callback.call(context, x, i);
      }
    }

    return;
  };
}());

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


exports.range = function utilsRange(start, stop, step, callback, context) {
  if (typeof stop === 'undefined' || typeof stop === 'function') {
    callback = stop;
    context = step;
    stop = start;
    start = 0;
    step = 1;
  }

  if (typeof step === 'undefined' || typeof step === 'function') {
    context = callback;
    callback = step;
    step = 1;
  }

  var result;
  if (typeof callback === 'undefined') {
    result = [];
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return result;
  }

  for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
    if (typeof callback === 'undefined') {
      result.push(i);
    } else {
      callback.call(typeof context === 'undefined' ? null : context, i);
    }
  }

  return result;
};