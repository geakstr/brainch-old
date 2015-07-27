exports.cloneAssoc = function utilsCloneAssoc(o) {
  var r = Object.create(null);
  for (var p in o) {
    r[p] = o[p];
  }
  return r;
};

exports.isFirefox = function utilsIsFirefox() {
  return (navigator.userAgent.toLowerCase().indexOf('firefox') > -1);
};

exports.htmlEntities = function utilsHtmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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