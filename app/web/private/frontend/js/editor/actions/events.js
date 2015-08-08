'use strict';

var app = require('common/app');
var block = require('frontend/editor/model/block');
var config = require('frontend/configs');
var helpers = require('frontend/editor/actions/helpers');
var protocol = require('common/protocol');
var selection = require('common/editor/selection').factory();
var utils = require('common/utils');

module.exports = function() {
  var that, model, fire, inputs;

  model = app.editor.model;

  inputs = require('frontend/editor/actions/inputs')();
  app.editor.inputs = inputs;

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
        app.editor.state.events.prevent = false;

        if (s !== null) {
          app.editor.state.events.prevent = true;
          app.editor.ot.can_op = true;

          if (helpers.is.actions.input.new_line(e)) {
            inputs.new_line(s);
          } else if (helpers.is.actions.input.delete(e)) {
            inputs.delete(s);
          } else if (helpers.is.actions.input.backspace(e)) {
            inputs.backspace(s);
          } else if (helpers.is.actions.input.tab(e)) {
            inputs.tab(s);
          } else if (helpers.is.events.undoredo(e, !e.shift)) {
            that.undo(e);
          } else if (helpers.is.events.undoredo(e, e.shift)) {
            that.redo(e);
          } else if (helpers.is.actions.input.char_under_selection(e, s)) {
            inputs.char_under_selection(s);
            app.editor.state.events.prevent = false;
          } else if (helpers.is.events.handled(s)) {
            app.editor.state.events.prevent = false;
            app.editor.ot.can_op = false;
            return false;
          } else {
            app.editor.state.events.prevent = false;
          }

        }

        if (app.editor.state.events.prevent) {
          e.prevent.default();
        } else {
          if (app.editor.state.events.keydown) {
            if (!app.editor.state.cancel.char) {
              inputs.just_char();
            }
            app.editor.state.cancel.char = false;
          }
        }

        app.editor.state.events.keydown = true;
        app.editor.state.events.paste = false;
        app.editor.state.events.cut = false;
        app.editor.state.events.copy = false;
        app.editor.state.container.html.length = model.container.innerHTML.length;

        return !app.editor.state.events.prevent;
      });
    },

    keyup: function(e) {
      return fire('keyup', e, selection.get(model), function(e, s) {
        if (app.editor.state.events.prevent) {
          app.editor.state.events.prevent = false;
          e.prevent.default();
          return false;
        }

        app.editor.state.events.prevent = false;

        if (app.editor.state.events.keydown) {
          app.editor.state.events.keydown = false;
          app.editor.ot.can_op = true;
          inputs.just_char();
        }

        return true;
      });
    },

    paste: function(e) {
      fire('paste', e, selection.get(model), function(e, s) {
        var i, l, pos, pasted, splited, offset;

        app.editor.state.events.paste = true;
        app.editor.state.events.cut = false;
        app.editor.state.events.copy = false;
        app.editor.state.events.prevent = true;
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

        app.editor.ot.can_op = true;
        model.history.batch.start(protocol.history.batch.text, s.clone());
        if (l === 1) {
          model.insert(s.clone(), splited[0]);
        } else {
          if (pos.start) {
            for (i = 0; i < l - 1; i += 1) {
              model.insert(s.start.i, block(splited[i]));
              s.start.i++;
              s.end.i++;
            }

            model.insert(s.clone(), splited[l - 1]);
          } else if (pos.end) {
            model.insert(s.clone(), splited[0]);

            for (i = 1; i < l; i += 1) {
              model.insert(++s.start.i, block(splited[i]));
            }
          } else {
            model.remove(s.start.block, s.start.pos, s.start.text.length);
            model.insert(s.start.block, splited[0], s.start.pos);

            if (s.is.range) {
              model.remove(s.start.i + 1, s.end.i);
            }

            for (i = 1; i < l - 1; i += 1) {
              model.insert(++s.start.i, block(splited[i]));
            }

            model.insert(++s.start.i, block(splited[l - 1] + s.end.text.substring(s.end.pos)));
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

      app.editor.state.events.paste = false;
      app.editor.state.events.cut = is_cut;
      app.editor.state.events.copy = !is_cut;
      app.editor.state.events.prevent = true;

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
        app.editor.ot.can_op = true;
        that.cutcopy(e, s, true);
        inputs.backspace(s);
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