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