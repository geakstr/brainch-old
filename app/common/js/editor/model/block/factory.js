'use strict';

var utils = require('common/utils');
var browser_block = require('frontend/editor/model/block');
var node_block = require('backend/editor/model/block');

module.exports = function(text) {
  var that;

  that = utils.is.browser() ? browser_block() : node_block();

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