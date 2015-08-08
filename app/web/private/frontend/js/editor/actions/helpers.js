'use strict';

var app = require('frontend/app');
var config = require('frontend/configs');
var keys = require('frontend/keys_map');
var utils = require('frontend/utils');

var is = exports.is = {
  actions: {
    input: {
      new_line: function(e) {
        return e.key === keys.enter;
      },

      delete: function(e) {
        return e.key === keys.delete;
      },

      backspace: function(e) {
        return e.key === keys.backspace;
      },

      tab: function(e) {
        return e.key === keys.tab && !e.shift;
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
      var is_arrow = (e.key === keys.up ||
        e.key === keys.down ||
        e.key === keys.left ||
        e.key === keys.right);

      return (is_arrow && !e.ctrl && !e.shift && !e.alt && !e.meta) ||
        (is_arrow && (e.ctrl || e.shift || e.alt || e.meta));
    },

    edit_keypress: function(e) {
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