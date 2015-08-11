'use strict';

var app = require('brainch-frontend/app');

module.exports = function(doc) {
  var that, can_op;

  doc = doc || {};
  doc.on = doc.on || function() {};
  doc.on('op', function(op, local) {
    if (!local) {
      app.editor.history.apply(op);
    }
  });

  that = {
    get doc() {
      return doc;
    },

    get can_op() {
      return can_op;
    },

    set can_op(val) {
      can_op = val;
    },

    op: function(op) {
      if (can_op) {
        doc.submitOp(op);
      }
    }
  };

  return that;
};