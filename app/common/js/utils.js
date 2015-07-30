Function.prototype.method = function(name, f) {
  this.prototype[name] = f;
  return this;
};

String.method('entitify', function() {
  return function() {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
 * @param {number}    start       Iterate from this index (inclusive)
 * @param {number}    stop        Iterate to this index (inclusive)
 * @param {number}    step        Iteration step (positive or negative)
 * @param {function}  callback    Callback function which call with
 *                                cur element and index params on each iteration
 * @param {object}    context     Context object for callback function
 * @param {function}  checker     Check function which call with
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

    var start;
    var stop;
    var step;
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

    start = start || 0;
    stop = stop || (this.length - 1);
    step = step || 1;
    context = context || this;

    if ((step > 0 && start > stop) || (step < 0 && start < stop)) {
      return;
    }

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
      r[p] = o[p];
    }
    return r;
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
    return Object.prototype.toString.call(x) === '[object Number]';
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
  }
};

exports.get = {
  args: function(x) {
    return Array.prototype.slice.apply(x);
  },
  arity: function(x) {
    return x.length;
  }
};

exports.event = function(event) {
  return {
    key: event.which,
    char: String.fromCharCode(event.which),
    alt: event.altKey,
    shift: event.shiftKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    prevent: function() {
      event.preventDefault();
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
};

exports.exceptions = {
  'function signature not supported': {
    name: 'TypeError',
    message: 'This function signature not supported'
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