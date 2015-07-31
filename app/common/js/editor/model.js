'use strict';

var utils = require('common/utils');
var block = require('common/editor/block').factory;
var keys = require('common/keys_map');

module.exports = function(dom) {
  var blocks = [];
  var history = {
    i: 0,
    store: []
  };

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

  blocks.update_indices = function(start, stop) {
    start = start || 0;
    stop = stop || (blocks.length - 1);
    blocks.loop(start, stop, function(x, i) {
      x.i = i;
    });
  };

  var that = {
    get blocks() {
      return blocks;
    },

    size: function() {
      return that.blocks.length;
    },

    get: function(i) {
      return that.blocks[i];
    },

    first: function() {
      return that.get(0);
    },

    last: function() {
      return that.get(that.size() - 1);
    },

    push: function(b) {
      return that.insert(that.size(), b);
    },

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