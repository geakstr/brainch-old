/** @module backend/editor/block */
'use strict';

var block = require('common/editor/block');

/**
 * This is model of 'block' data structure<br>
 * Store text, html, type and other metadata
 *
 * @alias module:backend/editor/block
 *
 * @param  {String} text Initial text
 *
 * @return {block}       Block object
 */
module.exports = function(text) {
  var container = {};

  var that = {
    /**
     * Block container which store data
     *
     * @public
     * @member {Object} container
     */
    get container() {
      return container;
    },

    /**
     * Block text
     *
     * @public
     * @member {String} text
     */
    get text() {
      return container.text || '';
    },

    set text(x) {
      container.html = block.build(x, '\n');
      that.type = block.detect_type(that.text);
    },

    /**
     * Block index in model
     *
     * @public
     * @member {Number} index
     */
    get i() {
      return container.i || 0;
    },

    set i(x) {
      container.i = x;
    },

    /**
     * Block type
     *
     * @public
     * @member {String} type
     *
     * @see {@link module:common/editor/block~Types}
     */
    get type() {
      return container.type || 'note';
    },

    set type(x) {
      container.type = x;
    }
  };

  return that;
};