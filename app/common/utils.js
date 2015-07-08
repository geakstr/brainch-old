exports.cloneAssoc = function cloneAssoc(o) {
  var r = Object.create(null);
  for (var p in o) {
    r[p] = o[p];
  }
  return r;
};