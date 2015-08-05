'use strict';

var utils = require('common/utils');
var selection = require('common/editor/selection').factory();
var protocol = require('common/protocol');

var app = require('common/app');

module.exports = function(model, title, start_selection) {
  var that, id, stories, end_selection, compress;

  id = app.editor.state.model.history.batch.offset;
  stories = [];

  compress = function(story) {
    var l, code, cur_actions, cur_action, prev_actions, prev_action;

    l = stories.length;
    if (l > 0) {
      cur_actions = story.actions;
      prev_actions = stories[l - 1].actions;

      if (cur_actions.length === 1 && prev_actions.length === 1) {
        cur_action = cur_actions[0];
        prev_action = prev_actions[0];

        code = cur_action[0];
        if (code === protocol.history.story.insert_text) {
          // Equals blocks indices and insert position
          if (cur_action[1] === prev_action[1] &&
            cur_action[3] === prev_action[2].length + prev_action[3]) {
            prev_action[2] += cur_action[2];
            return true;
          }
        }
      }
    }

    return false;
  };

  that = {
    get title() {
      return protocol.history.batch[title];
    },

    get id() {
      return id;
    },

    set id(val) {
      id = val;
    },

    get stories() {
      return stories;
    },

    get length() {
      return stories.length;
    },

    set stories(x) {
      stories = x;
    },

    set end_selection(s) {
      end_selection = s;
    },

    get end_selection() {
      return end_selection || start_selection;
    },

    to_json: function() {
      var json;

      json = [
        Date.now(),
        protocol.message.batch_history,
        id,
        title, [
          start_selection.start.i, start_selection.start.pos,
          that.end_selection.start.i, that.end_selection.start.pos
        ],
        stories.map(function(story) {
          return story.actions;
        })
      ];

      return JSON.stringify(json);
    },

    push: function(story) {
      if (!compress(story)) {
        stories.push(story);
      }
    },

    restore: function(direction, set_selection) {
      var undo, redo;

      undo = function() {
        var i, redo_batch, redo_stories;

        redo_stories = [];
        for (i = stories.length - 1; i >= 0; i -= 1) {
          redo_stories.push(stories[i].restore(direction));
        }
        redo_batch = module.exports(model, title, start_selection);
        redo_batch.id = id;
        redo_batch.stories = redo_stories;

        if (set_selection && !utils.is.undef(start_selection)) {
          selection.set(model.get(start_selection.start.i).container, start_selection.start.pos);
        }

        return redo_batch;
      };

      redo = function() {
        var i, l;

        l = stories.length;
        for (i = 0; i < l; i += 1) {
          stories[i].restore(direction);
        }

        if (set_selection && !utils.is.undef(end_selection)) {
          selection.set(model.get(that.end_selection.start.i).container, that.end_selection.start.pos);
        }

        return that;
      };

      return direction === -1 ? undo() : redo();
    }
  };

  return that;
};