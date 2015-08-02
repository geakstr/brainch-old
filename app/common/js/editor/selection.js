'use strict';

var utils = require('common/utils');
var browser_selection = require('frontend/editor/selection');
var node_selection = require('frontend/editor/selection');

exports.build = function(model) {
  var s = Object.create(null);

  s.start = Object.create(null);
  s.start.block = model.first();
  s.start.i = 0;
  s.start.text = s.start.block.text;
  s.start.pos = 0;

  s.end = Object.create(null);
  s.end.block = model.last();
  s.end.i = model.size() - 1;
  s.end.text = s.end.block.text;
  s.end.pos = s.end.text.length;

  s.is = Object.create(null);
  s.is.range = s.start.pos !== s.end.pos;
  s.is.caret = s.start.i === s.end.i && s.start.pos === s.end.pos;

  return s;
};

exports.clone = function(ctx) {
  ctx = ctx || this;

  var start = utils.clone.assoc(ctx.start);
  var end = utils.clone.assoc(ctx.end);

  var ret = utils.clone.assoc(ctx);
  ret.start = start;
  ret.end = end;

  return ret;
};

exports.factory = function() {
  return utils.is.browser() ? browser_selection : node_selection;
};