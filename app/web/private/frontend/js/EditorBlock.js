var commonutils = require('commonutils');

module.exports = (function() {
  function EditorBlock(text) {
    this.dom = this.createElement();
    this.text = text;
    this.type = this.text;

    this.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        this.processMutation();
      }.bind(this));
    }.bind(this));

    this.observer.observe(this.dom, {
      characterData: true,
      subtree: true
    });
  }

  Object.defineProperty(EditorBlock.prototype, 'i', {
    get: function() {
      return this.dom.getAttribute('data-i');
    },

    set: function(i) {
      this.dom.setAttribute('data-i', i);
    }
  });

  Object.defineProperty(EditorBlock.prototype, 'text', {
    get: function() {
      return this.dom.textContent;
    },

    set: function(text) {
      var gag = commonutils.isFirefox() ? '\n' : '';
      this.dom.innerHTML = text.length === 0 ? gag : text;

      this.processMutation();
    }
  });

  Object.defineProperty(EditorBlock.prototype, 'type', {
    get: function() {
      if (this.dom.classList.contains('task')) {
        return 'task';
      } else if (this.dom.classList.contains('empty')) {
        return 'empty';
      } else {
        return 'note';
      }
    },

    set: function(text) {
      this.dom.className = 'blck';

      if (text.trim()[0] === '-') {
        this.dom.classList.add('task');
      } else if (text.length === 0) {
        this.dom.classList.add('empty');
      } else {
        this.dom.classList.add('note');
      }
    }
  });

  EditorBlock.prototype.createElement = function editorCreateElement() {
    return document.createElement('p');
  };

  EditorBlock.prototype.processMutation = function editorBlockProcessMutation() {
    this.type = this.text;
  };

  EditorBlock.prototype.stopObserve = function editorBlockStopObserve() {
    this.observer.disconnect();
  };

  return EditorBlock;
})();