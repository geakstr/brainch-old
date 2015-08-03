'use strict';

var utils = require('common/utils');
var selection = require('common/editor/selection').factory();

var config = require('frontend/configs');
var helpers = require('frontend/editor/actions/helpers');
var block = require('common/editor/model/block');

module.exports = function(model, state) {
  var that, fire, inputs;

  inputs = require('frontend/editor/actions/inputs')(model, state);

  fire = function(title, e, s, callback) {
    try {
      if (config.debug.on && config.debug.events) {
        console.log(title);
      }
      return callback(utils.wrap.event(e), s);
    } catch (e) {
      model.history.batch.cancel();
      model.history.record.cancel();
      utils.exceptions.log(e);
      return false;
    } finally {
      model.history.record.stop();
    }
  };

  that = {
    keydown: function(e) {
      return fire('keydown', e, selection.get(model), function(e, s) {
        state.events.prevent.default = false;

        if (s !== null) {
          state.events.prevent.default = true;

          if (helpers.is.actions.input.new_line(e)) {
            inputs.new_line(s);
          } else if (helpers.is.actions.input.delete(e)) {
            inputs.delete(s);
          } else if (helpers.is.actions.input.backspace(e)) {
            inputs.backspace(s, 'backspace');
          } else if (helpers.is.actions.input.tab(e)) {
            inputs.tab(s);
          } else if (helpers.is.events.undoredo(e, !e.shift)) {
            that.undo(e);
          } else if (helpers.is.events.undoredo(e, e.shift)) {
            that.redo(e);
          } else if (helpers.is.actions.input.char_under_selection(e, s)) {
            inputs.char_under_selection(s);
            state.events.prevent.default = false;
          } else if (helpers.is.events.handled(s)) {
            state.events.prevent.default = false;
            return false;
          } else {
            state.events.prevent.default = false;
          }

        }

        if (state.events.prevent.default) {
          e.prevent.default();
        } else {
          if (state.events.was.keydown) {
            inputs.just_char();
          }
        }

        state.events.was.keydown = true;
        state.events.was.paste = false;
        state.events.was.cut = false;
        state.events.was.copy = false;
        state.dom.html.length = model.container.innerHTML.length;

        return !state.events.prevent.default;
      });
    },

    keyup: function(e) {
      return fire('keyup', e, selection.get(model), function(e, s) {
        if (state.events.prevent.default) {
          state.events.prevent.default = false;
          e.prevent.default();
          return false;
        }

        state.events.prevent.default = false;

        if (state.events.was.keydown) {
          state.events.was.keydown = false;
          inputs.just_char();
        }

        return true;
      });
    },

    paste: function(e) {
      fire('paste', e, selection.get(model), function(e, s) {
        var i, l, pos, pasted, splited, offset;

        state.events.was.paste = true;
        state.events.was.cut = false;
        state.events.was.copy = false;
        state.events.prevent.default = true;
        e.prevent.default();

        pasted = e.clipboard.get.text();
        if (pasted.length === 0) {
          return false;
        }

        pos = {
          start: s.is.caret && s.start.pos === 0 && s.start.i === 0,
          end: s.is.caret && s.end.pos === s.end.text.length && s.end.i === model.size() - 1
        };

        splited = pasted.split('\n');
        l = splited.length;
        offset = s.start.pos + pasted.length;

        model.history.batch.start('paste', s.clone());
        if (l === 1) {
          model.insert(s.clone(), splited[0]);
        } else {
          if (pos.start) {
            for (i = 0; i < l - 1; i += 1) {
              model.insert(s.start.i, block.factory(splited[i]));
              s.start.i++;
              s.end.i++;
            }

            model.insert(s.clone(), splited[l - 1]);
          } else if (pos.end) {
            model.insert(s.clone(), splited[0]);

            for (i = 1; i < l; i += 1) {
              model.insert(++s.start.i, block.factory(splited[i]));
            }
          } else {
            model.remove(s.start.block, s.start.pos, s.start.text.length);
            model.insert(s.start.block, splited[0], s.start.pos);

            if (s.is.range) {
              model.remove(s.start.i + 1, s.end.i);
            }

            for (i = 1; i < l - 1; i += 1) {
              model.insert(++s.start.i, block.factory(splited[i]));
            }

            model.insert(++s.start.i, block.factory(splited[l - 1] + s.end.text.substring(s.end.pos)));
          }

          offset = splited[l - 1].length;
        }
        model.history.record.stop();
        selection.set(model.get(s.start.i).container, offset);
        model.history.batch.stop(selection.get(model));

        return false;
      });
    },

    cutcopy: function(e, s, is_cut) {
      var text;

      e.prevent.default();

      state.events.was.paste = false;
      state.events.was.cut = is_cut;
      state.events.was.copy = !is_cut;
      state.events.prevent.default = true;

      text = (function() {
        var i, text;

        if (s.start.i === s.end.i) {
          return s.start.text.substring(s.start.pos, s.end.pos);
        }

        text = s.start.text.substring(s.start.pos) + '\n';
        for (i = s.start.i + 1; i < s.end.i; i += 1) {
          text += model.get(i).text + '\n';
        }
        return text + s.end.text.substring(0, s.end.pos);
      })();

      e.clipboard.set.text(text);

      return text;
    },

    cut: function(e) {
      return fire('cut', e, selection.get(model), function(e, s) {
        that.cutcopy(e, s, true);
        inputs.backspace(s, 'cut');
        return false;
      });
    },

    copy: function(e) {
      return fire('copy', e, selection.get(model), function(e, s) {
        that.cutcopy(e, s, false);
        return false;
      });
    },

    undo: function(e) {
      return fire('undo', e, selection.get(model), function(e, s) {
        model.history.undo(s);
        return false;
      });
    },

    redo: function(e) {
      return fire('redo', e, selection.get(model), function(e, s) {
        model.history.redo(s);
        return false;
      });
    }
  };

  return that;
};