'use strict';

var utils = require('common/utils');
var keys = require('common/keys_map');
var block = require('common/editor/model/block');
var protocol = require('common/protocol');

module.exports = function(container, ws) {
  var storage, history, that;

  storage = require('./storage')(container);
  history = require('./history')(ws);

  that = {
    get container() {
      return container;
    },

    get history() {
      return history;
    },

    size: function() {
      return storage.size();
    },

    get: function(i) {
      return storage.get(i);
    },

    set: function(i, b) {
      storage.set(i, b);
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
      var args, opts;

      opts = {
        block: function(i, b) {
          storage.blocks.splice(i, 0, b);
          history.push([protocol.history.story.insert_block, i, b.text]);
        },

        text: function(s, text) {
          var args, opts;

          opts = {
            under_selection: function(s, text) {
              var was_remove_to_end;

              if (s.is.range) {
                if (s.start.i < s.end.i) {
                  was_remove_to_end = true;
                  that.remove(s.start.block, s.start.pos, s.start.text.length);
                  that.remove(s.start.i + 1, s.end.i);
                } else {
                  that.remove(s.start.block, s.start.pos, s.end.pos);
                }
              }

              if (text === '\n') {
                if (!was_remove_to_end) {
                  that.remove(s.start.block, s.start.pos, s.start.text.length);
                }
                that.insert(s.start.i + 1, block.factory(s.end.text.substring(s.end.pos)));
              } else {
                that.insert(s.start.block, text, s.start.pos);
              }
            },

            in_block: function(b, text, pos) {
              var left, right;

              left = b.text.substring(0, pos);
              right = b.text.substring(pos);

              b.text = left + text + right;

              history.push([protocol.history.story.insert_text, b.i, text, pos]);
            }
          };

          args = utils.wrap.args(arguments);
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
        }
      };

      args = utils.wrap.args(arguments);
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
      var args, opts;

      opts = {
        blocks: function(from, to) {
          var i, deleted;

          deleted = storage.blocks.splice(from, to - from + 1);
          for (i = deleted.length - 1; i >= 0; i--) {
            history.push([protocol.history.story.remove_block, deleted[i].i, deleted[i].text]);
          }

          return deleted;
        },

        block: function(i) {
          return that.remove(i, i);
        },

        text: function() {
          var args, opts;

          opts = {
            under_selection: function(s, key_code) {
              var shift, pos, info, moved;

              shift = {
                back: key_code === keys.backspace ? -1 : 0,
                forward: key_code === keys.delete ? 1 : 0
              };

              pos = {
                start: s.is.caret && s.start.pos === 0,
                end: s.is.caret && s.end.text.length === s.end.pos
              };

              info = {
                i: s.start.i,
                pos: s.start.pos,
                cancel_story: false,
                stop_batch: true
              };

              if (pos.start && key_code === keys.backspace) {
                if (s.start.i === 0) {
                  info.cancel_story = true;
                  return info;
                }

                moved = s.start.block.text;
                s.start.block = that.get(--s.start.i);
                s.start.text = s.start.block.text;

                shift.back = 0;

                info.i = s.start.i;
                info.pos = s.start.text.length;

                that.remove(s.end.i);
                that.insert(s.start.block, moved, s.start.text.length);
              } else if (pos.end && key_code === keys.delete) {
                if (s.end.i === that.size() - 1) {
                  info.cancel_story = true;
                  return info;
                }

                s.end.block = that.get(++s.end.i);

                that.insert(s.start.block, s.end.block.text, s.start.block.text.length);
                that.remove(s.end.i);
              } else {
                if (s.is.range) {
                  shift.back = 0;
                  shift.forward = 0;

                  if (s.start.i < s.end.i) {
                    moved = s.end.text.substring(s.end.pos);
                    that.remove(s.start.block, s.start.pos, s.start.text.length);
                    that.insert(s.start.block, moved, s.start.pos);
                  } else {
                    that.remove(s.start.block, s.start.pos, s.start.text.length);
                  }

                  that.remove(s.start.i + 1, s.end.i);
                } else {
                  that.remove(s.start.block, s.start.pos + shift.back, s.end.pos + shift.forward);
                  info.stop_batch = false;
                }
              }

              info.pos += shift.back;

              return info;
            },

            in_block: function(b, start, end) {
              var left, right, removed;

              left = b.text.substring(0, start);
              right = b.text.substring(end);
              removed = b.text.substring(start, end);

              b.text = left + right;

              history.push([protocol.history.story.remove_text, b.i, removed, start]);
            }
          };

          args = utils.wrap.args(arguments);
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

      args = utils.wrap.args(arguments);
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

  history.model = that;

  return that;
};