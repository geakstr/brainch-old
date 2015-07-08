exports.cloneAssoc = function cloneAssoc(o) {
  var r = Object.create(null);
  for (var p in o) {
    r[p] = o[p];
  }
  return r;
};

exports.isFirefox = function isFirefox() {
  return (navigator.userAgent.toLowerCase().indexOf('firefox') > -1);
}