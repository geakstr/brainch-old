module.exports = (function() {
  function EditorBlock(text) {
    this.dom = document.createElement('p');
    this.text = text;
    this.type = this.text;

    this.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        this.fireMutation();
      }.bind(this));
    }.bind(this));

    this.observer.observe(this.dom, {
      characterData: true,
      subtree: true
    });
  }

  Object.defineProperty(EditorBlock.prototype, 'i', {
    set: function(i) {
      this.dom.setAttribute('data-i', i);
    }
  });

  Object.defineProperty(EditorBlock.prototype, 'text', {
    get: function() {
      return this.dom.textContent;
    },

    set: function(text) {
      this.dom.innerHTML = text.length === 0 ? '<br>' : text;

      this.fireMutation();
    }
  });

  Object.defineProperty(EditorBlock.prototype, 'type', {
    set: function(text) {
      this.dom.className = 'blck';

      if (text.trim()[0] === '-') {
        this.dom.classList.add('task');
      } else {
        this.dom.classList.add('note');
      }
    }
  });

  EditorBlock.prototype.fireMutation = function editorBlockFireMutation() {
    this.type = this.text;
  };

  EditorBlock.prototype.stopObserve = function editorBlockStopObserve() {
    this.observer.disconnect();
  };

  return EditorBlock;
})();