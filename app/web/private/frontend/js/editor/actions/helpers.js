'use strict';

var app = require('brainch-frontend/app');
var config = require('brainch-frontend/configs');
var utils = require('brainch-frontend/utils');

var is = exports.is = {
  actions: {
    input: {
      new_line: function(e) {
        return e.key === utils.key_codes.enter;
      },

      delete: function(e) {
        return e.key === utils.key_codes.delete;
      },

      backspace: function(e) {
        return e.key === utils.key_codes.backspace;
      },

      tab: function(e) {
        return e.key === utils.key_codes.tab && !e.shift;
      },

      char_under_selection: function(e, s) {
        return s.n > 0 && is.events.char_keypress(e);
      }
    }
  },
  events: {
    char_keypress: function(e) {
      app.editor.state.cancel.char = e.shift || e.alt;

      if (utils.is.num(e.key) && e.key > 0) {
        return !e.ctrl && !e.meta && is.events.handled_key(e.key);
      }

      return false;
    },

    navigation_keypress: function(e) {
      var is_arrow = (e.key === utils.key_codes.up ||
        e.key === utils.key_codes.down ||
        e.key === utils.key_codes.left ||
        e.key === utils.key_codes.right);

      return (is_arrow && !e.ctrl && !e.shift && !e.alt && !e.meta) ||
        (is_arrow && (e.ctrl || e.shift || e.alt || e.meta));
    },

    edit_keypress: function(e) {
      return (e.char === 'A' && (e.meta || e.ctrl));
    },

    handled_key: function(key_code) {
      var handled_key;

      for (handled_key in utils.key_codes) {
        if (key_code === utils.key_codes[handled_key]) {
          return false;
        }
      }

      return true;
    },

    handled: function(e) {
      return config.editor.handle_extended_actions &&
        !is.events.char_keypress(event) &&
        !is.events.navigation_keypress(event) &&
        !is.events.edit_keypress(event);
    },

    undoredo: function(e, shift) {
      return (e.key === 122 || e.key === 90) && (
        (utils.is.os.mac && (e.meta && shift && !e.ctrl && !e.alt)) ||
        (!utils.is.os.mac && (e.ctrl && shift && !e.meta && !e.alt))
      );
    }
  }
};