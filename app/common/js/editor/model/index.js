'use strict';

var utils = require('common/utils');
var keys = require('common/keys_map');

var block = require('common/editor/model/block');

module.exports = function(dom) {
  var storage = require('./storage')(dom);

  var that = {
    get storage() {
      return storage;
    },

    get history() {
      return history;
    },

    size: function() {
      return that.storage.size();
    },

    get: function(i) {
      return that.storage.get(i);
    },

    set: function(i, b) {
      that.storage.set(i, b);
    },

    first: function() {
      return that.get(0);
    },

    last: function() {
      return that.get(that.size() - 1);
    },

    push: function(blck) {
      return that.insert(that.size(), blck);
    },

    insert: function() {
      var opts = {
        block: function(i, blck) {
          storage.blocks.splice(i, 0, blck);
          history.push({
            name: 'insert.block',
            data: {
              block: block.utils.clone(blck)
            }
          });
        },

        text: function(s, text) {
          var opts = {
            under_selection: function(s, text) {
              that.remove(s.start.block, s.start.pos, s.start.text.length);
              if (s.is.range) {
                that.remove(s.start.i + 1, s.end.i);
              }

              s.end.text = s.end.text.substring(s.end.pos);
              if (text === '\n') {
                that.insert(s.start.i + 1, block.factory(s.end.text));
              } else {
                that.insert(s.start.block, text, s.start.pos);
              }
            },

            in_block: function(block, text, pos) {
              var left = block.text.substring(0, pos);
              var right = block.text.substring(pos);

              block.text = left + text + right;

              history.push({
                name: 'insert.text',
                data: {
                  i: block.i,
                  pos: pos,
                  text: text
                }
              });
            }
          };

          var args = utils.wrap.args(arguments);
          switch (args.arity) {
            case 0:
              return opts;
            case 2:
              if (utils.is.obj(args.i(0)) && utils.is.str(args.i(1))) {
                return opts.under_selection(args.i(0), args.i(1));
              }
              break;
            case 3:
              if (utils.is.obj(args.i(0)) &&
                utils.is.str(args.i(1)) &&
                utils.is.num(args.i(2))) {
                return opts.in_block(args.i(0), args.i(1), args.i(2));
              }
              break;
            default:
              utils.exceptions.log(utils.exceptions['signature not supported']());
          }
        },

        char: function(s) {
          var blck = that.get(s.start.i).normalize();

          history.push({
            name: 'insert.text',
            data: {
              i: s.start.i,
              pos: s.start.pos - 1,
              text: blck.text.substring(s.start.pos - 1, s.start.pos)
            }
          });

          return {
            i: s.start.i,
            pos: s.start.pos
          };
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
        case 3:
          if (utils.is.obj(args.i(0)) &&
            utils.is.str(args.i(1)) &&
            utils.is.num(args.i(2))) {
            return opts.text(args.i(0), args.i(1), args.i(2));
          }
          break;
        default:
          utils.exceptions.log(utils.exceptions['signature not supported']());
      }

      return null;
    },

    remove: function() {
      var opts = {
        blocks: function(from, to) {
          var removed = storage.blocks.splice(from, to - from + 1);
          history.push({
            name: 'remove.blocks',
            data: {
              blocks: removed
            }
          });
          return removed;
        },

        block: function(i) {
          return that.remove(i, i);
        },

        text: function() {
          var opts = {
            under_selection: function(s, key) {
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

                var moved = s.start.block.text;
                s.start.block = that.get(--s.start.i);
                s.start.text = s.start.block.text;

                shift.back = 0;

                caret.i = s.start.i;
                caret.pos = s.start.text.length;

                that.remove(s.end.i);
                that.insert(s.start.block, moved, s.start.text.length);
              } else if (pos.end && key === keys.delete) {
                if (s.end.i === that.size() - 1) {
                  return caret;
                }

                s.end.block = that.get(++s.end.i);

                that.insert(s.start.block, s.end.block.text, s.start.block.text.length);
                that.remove(s.end.i);
              } else {
                if (s.is.range) {
                  shift.back = 0;
                  shift.forward = 0;
                  that.remove(s.start.i + 1, s.end.i);
                }
                that.remove(s.start.block, s.start.pos + shift.back, s.end.pos + shift.forward);
              }

              caret.pos += shift.back;

              return caret;
            },

            in_block: function(block, start, end) {
              var left = block.text.substring(0, start);
              var rigth = block.text.substring(end);
              var removed = block.text.substring(start, end);

              block.text = left + rigth;

              history.push({
                name: 'remove.text',
                data: {
                  i: block.i,
                  pos: start,
                  text: removed
                }
              });
            }
          };

          var args = utils.wrap.args(arguments);
          switch (args.arity) {
            case 2:
              if (utils.is.obj(args.i(0)) && utils.is.num(args.i(1))) {
                return opts.under_selection(args.i(0), args.i(1));
              }
              break;
            case 3:
              if (utils.is.obj(args.i(0)) && utils.is.num(args.i(1)) && utils.is.num(args.i(2))) {
                return opts.in_block(args.i(0), args.i(1), args.i(2));
              }
              break;
            default:
              utils.exceptions.log(utils.exceptions['signature not supported']());
          }
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
        case 3:
          if (utils.is.obj(args.i(0)) && utils.is.num(args.i(1)) && utils.is.num(args.i(2))) {
            return opts.text(args.i(0), args.i(1), args.i(2));
          }
          break;
        default:
          utils.exceptions.log(utils.exceptions['signature not supported']());
      }

      return null;
    }
  };

  var history = require('./history')(that);

  return that;
};