'use strict';

var utils = require('common/utils');
var dom_block = require('frontend/editor/block');
var node_block = require('backend/editor/block');

exports.normalize = function(x) {
  return x.replace(/(\r\n|\n|\r)/gm, '');
};

exports.sanitize = function(x) {
  return x.entitify();
};

exports.decorate = function(x) {
  return x.replace(/big/g, '<span class="-date">big</span>');
};

exports.build = function(x, gag) {
  return x.length === 0 ? gag : exports.decorate(exports.sanitize(exports.normalize(x)));
};

var Types = exports.Types = {
  TASK: 'task',
  EMPTY: 'empty',
  NOTE: 'note'
};

exports.detect_type = function(x) {
  if (x.trim()[0] === '-') {
    return Types.TASK;
  } else if (x.length === 0) {
    return Types.EMPTY;
  }

  return Types.NOTE;
};

exports.factory = function(text) {
  var that = utils.is.browser() ? dom_block() : node_block();

  that.normalize = function() {
    that.text = that.text;
    return that;
  };

  Object.defineProperty(that, 'length', {
    get: function() {
      return that.text.length;
    }
  });

  that.text = text || '';

  return that;
};