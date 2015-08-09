'use strict';

var app = require('frontend/app');
var config = require('frontend/configs');
var helpers = require('frontend/editor/actions/helpers');
var selection = require('frontend/editor/selection');
var utils = require('frontend/utils');

module.exports = function() {
  var that, fire;

  app.editor.inputs = require('frontend/editor/actions/inputs')();

  fire = function(title, e, s, callback) {
    try {
      if (config.debug.on && config.debug.events) {
        console.log(title);
      }
      return callback(utils.wrap.event(e), s);
    } catch (e) {
      app.editor.history.batch.cancel();
      app.editor.history.record.cancel();
      console.log(e);
      console.log(e.stack);
      return false;
    } finally {
      app.editor.history.record.stop();
    }
  };

  that = {
    keydown: function(e) {
      return fire('keydown', e, selection.get(), function(e, s) {
        app.editor.state.events.prevent = true;
        app.editor.ot.can_op = true;

        if (helpers.is.actions.input.new_line(e)) {
          app.editor.inputs.new_line(s);
        } else if (helpers.is.actions.input.delete(e)) {
          app.editor.inputs.delete(s);
        } else if (helpers.is.actions.input.backspace(e)) {
          app.editor.inputs.backspace(s);
        } else if (helpers.is.actions.input.tab(e)) {
          app.editor.inputs.tab(s);
        } else if (helpers.is.events.undoredo(e, !e.shift)) {
          that.undo(e);
        } else if (helpers.is.events.undoredo(e, e.shift)) {
          that.redo(e);
        } else if (helpers.is.actions.input.char_under_selection(e, s)) {
          app.editor.inputs.char_under_selection(selection.get());
          app.editor.state.events.prevent = false;
        } else if (helpers.is.events.handled(s)) {
          app.editor.state.events.prevent = false;
          app.editor.ot.can_op = false;
          return false;
        } else {
          app.editor.state.events.prevent = false;
        }

        if (app.editor.state.events.prevent) {
          e.prevent.default();
        } else {
          if (app.editor.state.events.keydown) {
            if (!app.editor.state.cancel.char) {
              app.editor.inputs.just_char();
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
          app.editor.inputs.just_char();
        }

        return true;
      });
    },

    paste: function(e) {
      return fire('paste', e, selection.get(), function(e, s) {
        var t, end_block, splited;

        app.editor.state.events.paste = true;
        app.editor.state.events.cut = false;
        app.editor.state.events.copy = false;
        app.editor.state.events.prevent = true;
        e.prevent.default();

        t = e.clipboard.get.text();
        app.editor.ot.can_op = true;
        app.editor.model.remove_text(s.start, s.n);
        app.editor.model.insert_text(s.start, t);

        end_block = app.editor.model.get_block_by_retain(s.start + t.length);
        splited = t.split('\n');
        if (splited.length === 1) {
          selection.set(end_block.container, s.anchor_p + t.length);
        } else {
          selection.set(end_block.container, splited[splited.length - 1].length);
        }

        return false;
      });
    },

    cutcopy: function(e, s, is_cut) {
      e.prevent.default();

      app.editor.state.events.paste = false;
      app.editor.state.events.cut = is_cut;
      app.editor.state.events.copy = !is_cut;
      app.editor.state.events.prevent = true;

      e.clipboard.set.text(app.editor.model.get_n_chars(s.start, s.n));
    },

    cut: function(e) {
      return fire('cut', e, selection.get(), function(e, s) {
        app.editor.ot.can_op = true;
        that.cutcopy(e, s, true);
        app.editor.inputs.backspace(s);
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