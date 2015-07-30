var utils = require('common/utils');
var block = require('common/editor/block').factory;
var keys = require('common/keys_map');

module.exports = function(dom) {
  var blocks = [];
  var history = {
    i: 0,
    store: []
  };

  /**
   * Override default array splice method.
   * This also remove node elements in array from DOM.
   * And accept only one element for insert
   *
   * @param  {number} i start
   * @param  {number} n delete count
   * @param  {object} b item
   * @return {array}    deleted items
   */
  blocks.splice = function(i, n, b) {
    if (!utils.is.undef(b)) {
      return Array.prototype.splice.call(this, i, n, b);
    }

    var ret = Array.prototype.splice.call(this, i, n);

    if (dom && utils.is.browser()) {
      ret.forEach(function(x) {
        if (dom.contains(x.container)) {
          dom.removeChild(x.container);
        }
      });
    }

    return ret;
  };

  blocks.update_indices = function(start, stop) {
    start = start || 0;
    stop = stop || (blocks.length - 1);
    blocks.loop(start, stop, function(x, i) {
      x.i = i;
    });
  };

  var that = {
    /**
     * Get array of blocks
     * @return {array} array of blocks
     */
    get blocks() {
      return blocks;
    },

    /**
     * Get number of blocks
     * @return {number} number of blocks
     */
    size: function() {
      return that.blocks.length;
    },

    /**
     * Get block by index
     * @param  {number} i block index
     * @return {block}    block object
     */
    get: function(i) {
      return that.blocks[i];
    },

    first: function() {
      return that.get(0);
    },

    /**
     * Get last block in array
     * @return {block} block object
     */
    last: function() {
      return that.get(that.size() - 1);
    },

    push: function(b) {
      return that.insert(this.size(), b);
    },

    insert: function(i, b) {
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