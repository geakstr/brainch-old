var state = module.exports = {
  dom: {
    html: {
      length: null
    }
  },
  events: {
    prevent: {
      default: false
    },
    was: {
      keydown: false,
      cut: false,
      paste: false,
      copy: false,
      clipboard: function() {
        return state.events.was.paste || state.events.was.cut || state.events.was.copy;
      }
    }
  },
  prev: {
    cancel: {
      story: false,
      batch: false,
      char: false
    },
    stop: {
      batch: false
    },
    was: {
      char: false
    },
    selection: null,
    char: null
  },
  model: {
    history: {
      batch: {
        offset: 0
      }
    }
  }
};