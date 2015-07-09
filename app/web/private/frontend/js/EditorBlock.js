var commonutils = require('commonutils');

module.exports = (function() {
  function EditorBlock(text, blocks) {
    this.dom = this.createElement();
    this.text = text;
    this.type = this.text;
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
      return this.dom.textContent.replace(/(\r\n|\n|\r)/gm, '');
    },

    set: function(text) {
      var gag = commonutils.isFirefox() ? '\n' : '<br>';
      this.dom.innerHTML = text.length === 0 ? gag : this.process(text);

      this.type = this.text;
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

  EditorBlock.prototype.createElement = function editorBlockCreateElement() {
    return document.createElement('p');
  };

  EditorBlock.prototype.process = function editorBlockProcess(text) {
    return commonutils.htmlEntities(text);
  };

  EditorBlock.prototype.normalize = function editorBlockNormilize() {
    this.text = this.text;

    return this;
  };

  return EditorBlock;
})();