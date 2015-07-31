/** @module common/editor/model */
'use strict';

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
   * @return {block[]}    Removed items
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
    /**
     * Array of blocks
     *
     * @public
     * @member {block[]} blocks
     */
    get blocks() {
      return blocks;
    },

    /**
     * Get number of blocks
     *
     * @public
     * @method size
     *
     * @return {Number} Number of blocks
     */
    size: function() {
      return that.blocks.length;
    },

    /**
     * Get block by index
     *
     * @public
     * @method get
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
     * @public
     * @method first
     *
     * @return {block} Block object
     */
    first: function() {
      return that.get(0);
    },

    /**
     * Get last block in array
     *
     * @public
     * @method last
     *
     * @return {block} Block object
     */
    last: function() {
      return that.get(that.size() - 1);
    },

    /**
     * Add block to tail of array
     *
     * @public
     * @method push
     *
     * @param  {block}  b  Block for insert
     *
     * @return {block}     Pushed block
     */
    push: function(b) {
      return that.insert(this.size(), b);
    },

    /**
     * Insert text or block to model
     *
     * @public
     * @method insert
     *
     * @param  {(undefined|Object|Number)} x {undefined} When want to get manual choice of action<br>
     *                                       {Object}    Selection object when insert text<br>
     *                                       {Number}    Position (index) when insert block
     * @param  {(undefined|String|block)}  y {undefined} When want to get manual choice of action<br>
     *                                       {String}    Text when insert text<br>
     *                                       {block}     Block when insert block
     *
     * @return {(Object|undefined|block)}    {Object}    Actions when want to get manual choice of action<br>
     *                                       {undefined} When insert text<br>
     *                                       {block}     Inserted block when insert block
     *
     * @example {@lang javascript}
     * // Insert text under selection
     * model.insert(selection_object, text);
     *
     * // Insert block on index
     * model.insert(index, block);
     *
     *
     * // Get object with actions
     * var insert = model.insert();
     * var insert_text = insert.text;
     * var insert_block = insert.block;
     *
     * insert_text(selection_object, text);
     * insert_block(index, block);
     *
     * // Or compact
     * model.insert().text(selection_object, text);
     * model.insert().block(index, block);
     *
     */
    insert: function() {
      var args = utils.wrap.args(arguments);

      var opts = {
        block: function(i, b) {
          b.i = i;

          blocks.splice(i, 0, b);
          if (dom && utils.is.browser()) {
            dom.insertBefore(b.container, dom.childNodes[i]);
          }
          blocks.update_indices(i + 1);

          return b;
        },

        text: function(_s, text) {
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
        }
      };

      switch (args.arity) {
        case 0:
          return opts;
        case 2:
          if (utils.is.num(args.i(0)) && utils.is.obj(args.i(1))) {
            return opts.block(args.i(0), args.i(1));
          } else if (utils.is.obj(args.i(0)) && utils.is.str(args.i(1))) {
            return opts.text(args.i(0), args.i(1));
          }
          break;
        default:
          utils.exceptions.log(utils.exceptions['function signature not supported']());
      }

      return null;
    },

    /**
     * Remove text or block from model
     *
     * @public
     * @method remove
     *
     * @param {(undefined|Number|Object)} x {undefined} When want to get manual choice of action<br>
     *                                      {Number} When this is single arg this is index of block for remove<br>
     *                                      {Number} When has number in second arg this is 'from' idx in range
     *                                      for remove blocks<br>
     *                                      {Object} This is selection object for remove text
     *
     * @param {(undefined|Number)}        y {undefined} When want to get manual choice of action<br>
     *                                      {Number} When first arg is number this is 'to' idx in range for remove
     *                                      blocks. Otherwise when first arg is selection object this is key code
     *                                      (backspace or delete) for remove text
     *
     * @return {(block[]|Object)}           {Object} Actions when want to get manual choice of action<br>
     *                                      {block[]} When remove blocks this is array with removed items<br>
     *                                      {Object} When remove text this is object
     *                                      with information about new caret position
     *
     * @example {@lang javascript}
     * // Remove blocks from index (inclusive) to index (inclusive)
     * model.remove(from_idx, to_idx);
     *
     * // Remove block by index
     * model.remove(index)
     *
     * // Remove text under selection with key code (backspace or delete)
     * model.remove(selection_object, key_code)
     *
     *
     * // Get object with actions
     * var remove = model.remove();
     * var remove_blocks = remove.blocks;
     * var remove_block = remove.block;
     * var remove_text = remove.text;
     *
     * remove_blocks(from_idx, to_idx);
     * remove_block(index);
     * remove_text(selection_object, key_code);
     *
     * // Or compact
     * model.remove().blocks(from_idx, to_idx);
     * model.remove().block(index);
     * model.remove().text(selection_object, key_code);
     */
    remove: function() {
      var args = utils.wrap.args(arguments);

      var opts = {
        blocks: function(from, to) {
          var ret = blocks.splice(from, to - from + 1);
          blocks.update_indices(from);
          return ret;
        },

        block: function(i) {
          return that.remove(i, i);
        },

        text: function(_s, key) {
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
        }
      };

      switch (args.arity) {
        case 0:
          return opts;
        case 1:
          if (utils.is.num(args.i(0))) {
            return opts.block(args.i(0));
          }
          break;
        case 2:
          if (utils.is.num(args.i(0)) && utils.is.num(args.i(1))) {
            return opts.blocks(args.i(0), args.i(1));
          } else if (utils.is.obj(args.i(0)) && utils.is.num(args.i(1))) {
            return opts.text(args.i(0), args.i(1));
          }
          break;
        default:
          if (utils.is.num(args.i(0)) && utils.is.num(args.i(1))) {
            return opts.blocks(args.i(0), args.i(1));
          } else if (utils.is.obj(args.i(0)) && utils.is.num(args.i(1))) {
            return opts.text(args.i(0), args.i(1));
          }
      }

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