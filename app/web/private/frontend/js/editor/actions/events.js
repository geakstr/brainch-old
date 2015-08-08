'use strict';

var app = require('frontend/app');
var config = require('frontend/configs');
var helpers = require('frontend/editor/actions/helpers');
var selection = require('frontend/editor/selection');
var utils = require('frontend/utils');

module.exports = function() {
  var that, fire, inputs;

  inputs = require('frontend/editor/actions/inputs')();
  app.editor.inputs = inputs;

  fire = function(title, e, s, callback) {
    try {
      if (config.debug.on && config.debug.events) {
        console.log(title);
      }
      return callback(utils.wrap.event(e), s);
    } catch (e) {
      app.editor.history.batch.cancel();
      app.editor.history.record.cancel();
      utils.exceptions.log(e);
      return false;
    } finally {
      app.editor.history.record.stop();
    }
  };

  that = {
    keydown: function(e) {
      return fire('keydown', e, selection.get(), function(e, s) {
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
            inputs.char_under_selection(selection.get());
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

        app.editor.ot.can_op = false;
        app.editor.state.events.keydown = true;
        app.editor.state.events.paste = false;
        app.editor.state.events.cut = false;
        app.editor.state.events.copy = false;
        app.editor.state.container.html.length = app.editor.container.innerHTML.length;

        return !app.editor.state.events.prevent;
      });
    },

    keyup: function(e) {
      return fire('keyup', e, selection.get(), function(e, s) {
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
      fire('paste', e, selection.get(), function(e, s) {
        app.editor.state.events.paste = true;
        app.editor.state.events.cut = false;
        app.editor.state.events.copy = false;
        app.editor.state.events.prevent = true;
        e.prevent.default();

        app.editor.model.insert_text(s.start, e.clipboard.get.text());

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

      text = app.editor.model.get_n_chars(s.start, s.n);

      e.clipboard.set.text(text);

      return text;
    },

    cut: function(e) {
      return fire('cut', e, selection.get(), function(e, s) {
        app.editor.ot.can_op = true;
        that.cutcopy(e, s, true);
        inputs.backspace(s);
        return false;
      });
    },

    copy: function(e) {
      return fire('copy', e, selection.get(), function(e, s) {
        that.cutcopy(e, s, false);
        return false;
      });
    },

    undo: function(e) {
      return fire('undo', e, selection.get(), function(e, s) {
        app.editor.history.undo(s);
        return false;
      });
    },

    redo: function(e) {
      return fire('redo', e, selection.get(), function(e, s) {
        app.editor.history.redo(s);
        return false;
      });
    }
  };

  return that;
};