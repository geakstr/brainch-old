'use strict';

var utils = require('common/utils');
var keys = require('common/keys_map');

var block = require('./block');

module.exports = function(dom) {
  var blocks = block.utils.storage(dom);

  var history = require('./history')();

  var that = {
    get blocks() {
      return blocks;
    },

    get history() {
      return history;
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
      var opts = {
        block: function(i, b) {
          blocks.splice(i, 0, b);
        },

        text: function(_s, text) {
          var s = utils.clone.assoc(_s);

          s.start.block.text = s.start.text.substring(0, s.start.pos);
          if (s.is.range) {
            that.remove(s.start.i + 1, s.end.i);
          }

          s.end.text = s.end.text.substring(s.end.pos);
          if (text === '\n') {
            that.insert(s.start.i + 1, block.factory(s.end.text));
          } else {
            s.start.block.text += text + s.end.text;
          }
        }
      };

      var args = utils.wrap.args(arguments);
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
      var opts = {
        blocks: function(from, to) {
          return blocks.splice(from, to - from + 1);
        },

        block: function(i) {
          return that.remove(i, i);
        },

        text: function(_s, key) {
          var s = utils.clone.assoc(_s);

          var shift = {
            back: key === keys.backspace ? -1 : 0,
            forward: key === keys.delete ? 1 : 0
          };

          var pos = {
            start: s.is.caret && s.start.pos === 0,
            end: s.is.caret && s.end.text.length === s.end.pos
          };

          var caret = {
            i: s.start.i,
            pos: s.start.pos
          };

          if (pos.start && key === keys.backspace) {
            if (s.start.i === 0) {
              return caret;
            }

            s.start.block = that.get(--s.start.i);
            s.start.text = s.start.block.text;

            shift.back = 0;

            caret.i = s.start.i;
            caret.pos = s.start.text.length;

            that.remove(s.end.i);
          } else if (pos.end && key === keys.delete) {
            if (s.end.i === that.size() - 1) {
              return caret;
            }

            s.end.block = that.get(++s.end.i);
            s.end.text = s.end.block.text;

            that.remove(s.end.i);
          } else {
            if (s.is.range) {
              shift.back = 0;
              shift.forward = 0;
              that.remove(s.start.i + 1, s.end.i);
            }

            s.start.text = s.start.text.substring(0, s.start.pos + shift.back);
            s.end.text = s.end.text.substring(s.end.pos + shift.forward);
          }

          s.start.block.text = s.start.text + s.end.text;

          caret.pos += shift.back;

          return caret;
        }
      };

      var args = utils.wrap.args(arguments);
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
          utils.exceptions.log(utils.exceptions['function signature not supported']());
      }

      return null;
    }
  };

  return that;
};