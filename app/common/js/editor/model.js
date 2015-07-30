'use strict';

/** @module common/editor/model */

var utils = require('common/utils');
var block = require('common/editor/block').factory;
var keys = require('common/keys_map');

/**
 * Model represent document and working with it
 *
 * @alias module:common/editor/model
 *
 * @param  {Node} dom Node in DOM where model applied
 *
 * @return {model}    Model object
 */
module.exports = function(dom) {
  /**
   * Store blocks
   *
   * @private
   *
   * @type {Array}
   */
  var blocks = [];
  var history = {
    i: 0,
    store: []
  };

  /**
   * Override default array splice method for 'blocks' variable
   * This also remove associated node elements in array from DOM.
   * Accept only one element (block) for insert
   *
   * @private
   *
   * @param  {Number} i Start index (inclusive)
   * @param  {Number} n Delete count
   * @param  {Object} b Block object
   *
   * @return {Array}    Removed items
   */
  blocks.splice = function(i, n, b) {
    if (!utils.is.undef(b)) {
      return Array.prototype.splice.call(this, i, n, b);
    }

    var removed = Array.prototype.splice.call(this, i, n);

    if (dom && utils.is.browser()) {
      removed.forEach(function(x) {
        if (dom.contains(x.container)) {
          dom.removeChild(x.container);
        }
      });
    }

    return removed;
  };

  /**
   * Update indices of blocks in 'blocks' variable
   *
   * @private
   *
   * @param  {Number} start Start from index (inclusive)
   * @param  {Number} stop  Go to this index (inclusive)
   */
  blocks.update_indices = function(start, stop) {
    start = start || 0;
    stop = stop || (blocks.length - 1);
    blocks.loop(start, stop, function(x, i) {
      x.i = i;
    });
  };

  var that = {
    /** @lends module:common/editor/model.model */

    /**
     * Get all blocks
     *
     * @function blocks
     *
     * @return {Array} Blocks objects in array
     */
    get blocks() {
      return blocks;
    },

    /**
     * Get number of blocks
     *
     * @function size
     *
     * @return {Number} Number of blocks
     */
    size: function() {
      return that.blocks.length;
    },

    /**
     * Get block by index
     *
     * @function get
     *
     * @param  {Number} i Index of block
     *
     * @return {block}    Block object
     */
    get: function(i) {
      return that.blocks[i];
    },

    /**
     * Get first block in array
     *
     * @function first
     *
     * @return {block} Block object
     */
    first: function() {
      return that.get(0);
    },

    /**
     * Get last block in array
     *
     * @function last
     *
     * @return {block} Block object
     */
    last: function() {
      return that.get(that.size() - 1);
    },

    /**
     * Add block to tail of array
     *
     * @function push
     *
     * @param  {block}  b  Block for insert
     *
     * @return {block}     Pushed block
     */
    push: function(b) {
      return that.insert(this.size(), b);
    },

    /**
     * Insert text or block to model<br>
     *
     * @example {@lang javascript}
     * // Insert text under selection
     * model.insert(selection_object, text);
     * // Insert block on index
     * model.insert(index, block);
     *
     * @function insert
     *
     * @param  {Object|Number}   x {Object} Selection object when insert text<br>
     *                             {Number} Position (index) when insert block
     * @param  {String|block}    y {String} Text when insert text<br>
     *                             {block}  Block when insert block
     *
     * @return {undefined|block}   {undefined} When insert text<br>
     *                             {block} When insert block
     */
    insert: function() {
      var args = utils.get.args(arguments);

      var insert_block = function(i, b) {
        b.i = i;

        blocks.splice(i, 0, b);
        if (dom && utils.is.browser()) {
          dom.insertBefore(b.container, dom.childNodes[i]);
        }
        blocks.update_indices(i + 1);

        return b;
      };

      var insert_text = function(_s, text) {
        var s = utils.clone.assoc(_s);

        s.start.block.text = s.start.text.substring(0, s.start.pos);
        if (s.is.range) {
          that.remove(s.start.i + 1, s.end.i);
        }

        s.end.text = s.end.text.substring(s.end.pos);
        if (text === '\n') {
          that.insert(s.start.i + 1, block(s.end.text));
        } else {
          s.start.block.text += text + s.end.text;
        }

        return;
      };

      if (utils.get.arity(args) === 2) {
        if (utils.is.num(args[0]) && utils.is.obj(args[1])) {
          return insert_block(args[0], args[1]);
        } else if (utils.is.obj(args[0]) && utils.is.str(args[1])) {
          return insert_text(args[0], args[1]);
        }
      }

      utils.exceptions.log(utils.exceptions['function signature not supported']());

      return null;
    },

    /**
     * Remove text or block from model<br>
     *
     * @example {@lang javascript}
     * // Remove blocks from index (inclusive) to index (inclusive)
     * model.remove(from_idx, to_idx);
     * // Remove block by index
     * model.remove(index)
     * // Remove text under selection with key code (backspace or delete)
     * model.remove(selection_object, key_code)
     *
     * @function remove
     *
     * @param {Number|Object}   x {Number} When this is single arg this is<br>
     *                            index of block for remove<br>
     *                            {Number} When has number in second arg<br>
     *                            this is 'from' idx in range for remove blocks<br>
     *                            {Object} This is selection object for remove<br>
     *                            text
     *
     * @param {Number}          y When first arg is number this is 'to' idx in<br>
     *                            range for remove blocks. Otherwise when first<br>
     *                            arg is selection object this is<br>
     *                            key code (backspace or delete)
     *
     * @return {Array|Object}     {Array} When remove blocks this is array<br>
     *                            with removed items<br>
     *                            {Object} When remove text this is object<br>
     *                            with information about new caret position
     */
    remove: function() {
      var args = utils.get.args(arguments);

      var remove_blocks_range = function(from, to) {
        var ret = blocks.splice(from, to - from + 1);
        blocks.update_indices(from);
        return ret;
      };

      var remove_block = function(i) {
        return that.remove(i, i);
      };

      var remove_text = function(_s, key) {
        var s = utils.clone.assoc(_s);

        var offset = {
          backspace: (key === keys.backspace) ? -1 : 0,
          delete: (key === keys.delete) ? 1 : 0
        };

        var caret = {
          i: s.start.i,
          pos: s.start.pos
        };

        if (s.is.caret && key === keys.backspace && s.start.pos === 0) {
          if (s.start.i === 0) {
            return caret;
          }

          s.start.block = that.get(--s.start.i);
          s.start.text = s.start.block.text;

          offset.backspace = 0;

          caret.i = s.start.i;
          caret.pos = s.start.text.length;

          that.remove(s.end.i);
        } else if (s.is.caret && key === keys.delete && s.end.text.length === s.end.pos) {
          if (s.end.i === that.size() - 1) {
            return caret;
          }

          s.end.block = that.get(++s.end.i);
          s.end.text = s.end.block.text;

          that.remove(s.end.i);
        } else {
          if (s.is.range) {
            offset.backspace = 0;
            offset.delete = 0;

            that.remove(s.start.i + 1, s.end.i);
          }

          s.start.text = s.start.text.substring(0, s.start.pos + offset.backspace);
          s.end.text = s.end.text.substring(s.end.pos + offset.delete);
        }

        s.start.block.text = s.start.text + s.end.text;

        caret.pos += offset.backspace;

        return caret;
      };

      if (utils.get.arity(args) === 1) {
        if (utils.is.num(args[0])) {
          return remove_block(args[0]);
        }
      } else if (utils.get.arity(args) === 2) {
        if (utils.is.num(args[0]) && utils.is.num(args[1])) {
          return remove_blocks_range(args[0], args[1]);
        } else if (utils.is.obj(args[0]) && utils.is.num(args[1])) {
          return remove_text(args[0], args[1]);
        }
      }

      utils.exceptions.log(utils.exceptions['function signature not supported']());

      return null;
    },

    saveToHistory: function(action) {
      history.store = history.store.slice(0, history.i + 1);
      history.store.push(action(history.store[history.i]));
      history.i++;
    }
  };

  return that;
};