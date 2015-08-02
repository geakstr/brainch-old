'use strict';

var utils = require('common/utils');
var block = require('common/editor/model/block').factory;
var keys = require('common/keys_map');

var config = require('frontend/configs');
var selection = require('common/editor/selection').factory();

module.exports = function(dom) {
  dom.setAttribute('spellcheck', false);
  dom.setAttribute('contenteditable', true);

  var model = require('common/editor/model')(dom);

  var state = {
    dom: {
      html: {
        length: dom.innerHTML.length
      }
    },
    events: {
      prevent: {
        default: false
      },
      was: {
        keydown: false,
        keypress: false,
        keyup: false,
        cut: false,
        paste: false,
        copy: false
      }
    }
  };

  var actions = {
    input: {
      new_line: function(s) {
        model.history.record.start('new_line', s.clone());
        model.insert(s.clone(), '\n');
        model.history.record.stop();
        selection.set(model.get(s.start.i + 1).container, 0);
      },

      delete: function(s) {
        model.history.record.start('delete', s.clone());
        var caret = model.remove(s.clone(), keys.delete);
        model.history.record.stop();
        selection.set(model.get(caret.i).container, caret.pos);
      },

      backspace: function(s) {
        model.history.record.start('backspace', s.clone());
        var caret = model.remove(s.clone(), keys.backspace);
        model.history.record.stop();
        selection.set(model.get(caret.i).container, caret.pos);
      },

      tab: function(s) {
        model.history.record.start('tab', s.clone());
        model.insert(s.clone(), '\t');
        model.history.record.stop();
        selection.set(model.get(s.start.i).container, s.start.pos + 1);
      },

      char_under_selection: function(s) {
        model.history.record.start('char_under_selection', s.clone());
        model.remove(s.clone(), keys.backspace);
        model.history.record.stop();
        selection.set(model.get(s.start.i).container, s.start.pos);
      },

      just_char: function(was_keydown, was_keypress, was_keyup) {
        if (state.events.was.cut ||
          state.events.was.copy ||
          state.events.was.paste) {
          return;
        }

        if (state.dom.html.length === dom.innerHTML.length) {
          return;
        }

        state.dom.html.length = dom.innerHTML.length;

        var s = selection.get(model);

        model.history.record.start('just_char', s.clone());
        var caret = model.insert().char(s.clone());
        model.history.record.stop();

        selection.set(model.get(caret.i).container, caret.pos);

        state.events.was.keydown = was_keydown;
        state.events.was.keypress = was_keypress;
        state.events.was.keyup = was_keyup;
      }
    },
    event: {
      undo: function() {
        if (config.debug.on && config.debug.events) {
          console.log('undo');
        }

        model.history.undo();
      },

      redo: function() {
        if (config.debug.on && config.debug.events) {
          console.log('redo');
        }

        model.history.redo();
      }
    }
  };

  var is = {
    actions: {
      input: {
        new_line: function(event) {
          var e = utils.wrap.event(event);
          return e.key === keys.enter || (e.char === 'M' && e.ctrl);
        },

        delete: function(event) {
          var e = utils.wrap.event(event);
          return e.key === keys.delete;
        },

        backspace: function(event) {
          var e = utils.wrap.event(event);
          return e.key === keys.backspace;
        },

        tab: function(event) {
          var e = utils.wrap.event(event);
          return e.key === keys.tab && !e.shift;
        },

        char_under_selection: function(event, s) {
          return s.start.i < s.end.i && is.events.char_keypress(event);
        }
      }
    },
    events: {
      char_keypress: function(event) {
        var e = utils.wrap.event(event);
        if (utils.is.num(e.key) && e.key > 0) {
          return !e.ctrl && !e.meta && this.handled_key(e.key);
        }

        return false;
      },

      navigation_keypress: function(event) {
        var e = utils.wrap.event(event);
        var is_arrow = (e.key === keys.up ||
          e.key === keys.down ||
          e.key === keys.left ||
          e.key === keys.right);

        return (is_arrow && !e.ctrl && !e.shift && !e.alt && !e.meta) ||
          (is_arrow && (e.ctrl || e.shift || e.alt || e.meta));
      },

      edit_keypress: function(event) {
        var e = utils.wrap.event(event);

        return (e.char === 'A' && (e.meta || e.ctrl));
      },

      handled_key: function(key_code) {
        var handled_key;
        for (handled_key in keys) {
          if (key_code === keys[handled_key]) {
            return false;
          }
        }

        return true;
      },

      handled: function(event) {
        return config.editor.handle_extended_actions &&
          !is.events.char_keypress(event) &&
          !is.events.navigation_keypress(event) &&
          !is.events.edit_keypress(event);
      },

      undoredo: function(event, shift) {
        var e = utils.wrap.event(event);

        return (e.key === 122 || e.key === 90) && (
          (utils.is.os.mac && (e.meta && shift && !e.ctrl && !e.alt)) ||
          (!utils.is.os.mac && (e.ctrl && shift && !e.meta && !e.alt))
        );
      }
    }
  };

  var events = {
    keydown: function(event) {
      try {
        var e = utils.wrap.event(event);
        if (config.debug.on && config.debug.events) {
          console.log('keydown');
        }

        state.events.prevent.default = false;

        var s = selection.get(model);
        if (s !== null) {
          state.events.prevent.default = true;

          if (is.actions.input.new_line(event)) {
            actions.input.new_line(s);
          } else if (is.actions.input.delete(event)) {
            actions.input.delete(s);
          } else if (is.actions.input.backspace(event)) {
            actions.input.backspace(s);
          } else if (is.actions.input.tab(event)) {
            actions.input.tab(s);
          } else if (is.events.undoredo(event, !e.shift)) {
            actions.event.undo();
          } else if (is.events.undoredo(event, e.shift)) {
            actions.event.redo();
          } else if (is.actions.input.char_under_selection(event, s)) {
            actions.input.char_under_selection(s);
            state.events.prevent.default = false;
          } else if (is.events.handled(s)) {
            state.events.prevent.default = false;
            return false;
          } else {
            state.events.prevent.default = false;
          }

        }

        if (state.events.prevent.default) {
          e.prevent.default();
        } else {
          if (state.events.was.keydown || state.events.was.keypress) {
            actions.input.just_char(true, false, false);
          }
        }

        state.events.was.keydown = true;
        state.events.was.keypress = false;
        state.events.was.keyup = false;
        state.events.was.copy = false;
        state.events.was.paste = false;
        state.events.was.cut = false;
        state.dom.html.length = dom.innerHTML.length;

        return !state.events.prevent.default;
      } catch (e) {
        model.history.record.cancel();
        utils.exceptions.log(e);
        return false;
      } finally {
        model.history.record.stop();
      }
    },

    keypress: function(event) {
      try {
        if (config.debug.on && config.debug.events) {
          console.log('keypress');
        }

        if (state.events.was.keypress) {
          actions.input.just_char(false, true, false);
        }

        return true;
      } catch (e) {
        model.history.record.cancel();
        utils.exceptions.log(e);
        return false;
      } finally {
        model.history.record.stop();
      }
    },

    keyup: function(event) {
      try {
        var e = utils.wrap.event(event);
        if (config.debug.on && config.debug.events) {
          console.log('keyup');
        }

        if (state.events.prevent.default) {
          state.events.prevent.default = false;
          e.prevent.default();
          return false;
        }

        state.events.prevent.default = false;

        if (state.events.was.keydown || !state.events.was.keypress) {
          actions.input.just_char(false, false, true);
        }

        return true;
      } catch (e) {
        model.history.record.cancel();
        utils.exceptions.log(e);
        return false;
      } finally {
        model.history.record.stop();
      }
    },

    paste: function(event) {
      try {
        var e = utils.wrap.event(event);
        if (config.debug.on && config.debug.events) {
          console.log('onpaste');
        }

        state.events.was.copy = false;
        state.events.was.paste = true;
        state.events.was.cut = false;
        state.events.prevent.default = true;
        e.prevent.default();

        var s = selection.get(model);

        var pasted = e.clipboard.get.text();
        var splited = pasted.split('\n');
        var len = splited.length;
        var offset = s.start.pos + pasted.length;

        if (len === 0) {
          return false;
        } else if (len === 1) {
          model.insert(s.clone(), splited[0]);
        } else {
          if (s.is.caret && s.start.pos === 0 && s.start.i === 0) {
            utils.range(splited - 1, function(i) {
              model.insert(s.start.i, block(splited[i]));
              s.start.i++;
              s.end.i++;
            });

            model.insert(s.clone(), splited[len - 1]);
          } else if (s.is.caret && s.end.pos === s.end.text.length && s.end.i === model.size() - 1) {
            model.insert(s.clone(), splited[0]);

            utils.range(1, len, function(i) {
              model.insert(++s.start.i, block(splited[i]));
            });
          } else {
            s.start.text = s.start.text.substring(0, s.start.pos);
            s.end.text = s.end.text.substring(s.end.pos);

            s.start.block.text = s.start.text + splited[0];

            if (s.is.range) {
              model.remove(s.start.i + 1, s.end.i);
            }

            utils.range(1, len - 1, function(i) {
              model.insert(++s.start.i, block(splited[i]));
            });

            model.insert(++s.start.i, block(splited[len - 1] + s.end.text));
          }

          offset = splited[len - 1].length;
        }

        selection.set(model.get(s.start.i).container, offset);

        return false;
      } catch (e) {
        model.history.record.cancel();
        utils.exceptions.log(e);
        return false;
      } finally {
        model.history.record.stop();
      }
    },

    cut: function(event) {
      try {
        var e = utils.wrap.event(event);
        if (config.debug.on && config.debug.events) {
          console.log('oncut');
        }

        state.events.was.copy = false;
        state.events.was.paste = false;
        state.events.was.cut = true;
        state.events.prevent.default = true;
        e.prevent.default();

        var s = selection.get(model);

        var text = '';
        if (s.start.i === s.end.i) {
          text = s.start.text.substring(s.start.pos, s.end.pos);
        } else {
          text = s.start.text.substring(s.start.pos) + '\n';

          utils.range(s.start.i + 1, s.end.i, function(i) {
            text += model.get(i).text + '\n';
          });

          text += s.end.text.substring(0, s.end.pos);
        }

        e.clipboard.set.text(text);

        model.remove(s.clone(), keys.backspace);
        selection.set(s.start.block.container, s.start.pos);

        return false;
      } catch (e) {
        model.history.record.cancel();
        utils.exceptions.log(e);
        return false;
      } finally {
        model.history.record.stop();
      }
    },

    copy: function(event) {
      try {
        var e = utils.wrap.event(event);
        if (config.debug.on && config.debug.events) {
          console.log('oncopy');
        }

        state.events.was.copy = true;
        state.events.was.paste = false;
        state.events.was.cut = false;
        state.events.prevent.default = true;
        e.prevent.default();

        var s = selection.get(model);

        var text = '';
        if (s.start.i === s.end.i) {
          text += s.start.text.substring(s.start.pos, s.end.pos);
        } else {
          text += s.start.text.substring(s.start.pos) + '\n';

          utils.range(s.start.i + 1, s.end.i, function(i) {
            text += model.get(i).text + '\n';
          });

          text += s.end.text.substring(0, s.end.pos);
        }

        e.clipboard.set.text(text);

        return false;
      } catch (e) {
        model.history.record.cancel();
        utils.exceptions.log(e);
        return false;
      } finally {
        model.history.record.stop();
      }
    }
  };

  dom.onkeydown = events.keydown;
  dom.onkeyup = events.keyup;
  dom.onkeypress = events.keypress;
  dom.onpaste = events.paste;
  dom.oncut = events.cut;
  dom.oncopy = events.copy;

  var that = {
    get model() {
      return model;
    },

    get dom() {
      return dom;
    }
  };

  return that;
};