'use strict';

exports.build = function(model) {
  var info = Object.create(null);

  info.start = Object.create(null);
  info.start.block = model.first();
  info.start.i = 0;
  info.start.text = info.start.block.text;
  info.start.pos = 0;

  info.end = Object.create(null);
  info.end.block = model.last();
  info.end.i = model.size() - 1;
  info.end.text = info.end.block.text;
  info.end.pos = info.end.text.length;

  return info;
};