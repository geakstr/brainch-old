'use strict';

var app = module.exports = {
  api: {
    ws: null
  },
  editor: {
    container: null,
    model: null,
    history: null,
    events: null,
    inputs: null,
    doc: null,
    state: {
      selection: null,
      char: null,
      container: {
        html: {
          length: null
        }
      },
      events: {
        prevent: false,
        keydown: false,
        paste: false,
        cut: false,
        copy: false,
        clipboard: function() {
          return app.editor.state.events.paste ||
            app.editor.state.events.cut ||
            app.editor.state.events.copy;
        }
      },
      model: {
        history: {
          batch: {
            offset: 0
          }
        }
      },
      cancel: {
        char: false,
        story: false,
        batch: false
      },
      stop: {
        batch: false
      }
    }
  }
};