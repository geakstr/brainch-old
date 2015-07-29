var utils = require('utils');

module.exports = (function() {
  function EditorBlock(text) {
    this.dom = this.createElement();
    this.text = text;
    this.type = this.text;
  }

  EditorBlock.build = function editorBlockBuild(block) {
    if (typeof block === 'string') {
      block = new EditorBlock(block);
    } else if (typeof block === 'undefined') {
      block = new EditorBlock('');
    }

    return block;
  };

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
      var gag = utils.isFirefox() ? '\n' : '<br>';
      this.dom.innerHTML = text.length === 0 ? gag : this.process(this.sanitize(text));

      this.type = this.text;
    }
  });

  Object.defineProperty(EditorBlock.prototype, 'length', {
    get: function() {
      return this.text.length;
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

  EditorBlock.prototype.sanitize = function editorBlockSanitize(text) {
    return utils.htmlEntities(text.replace(/(\r\n|\n|\r)/gm, ''));
  };

  EditorBlock.prototype.process = function editorBlockProcess(text) {
    text = text.replace(/big/g, '<span class="-date">big</span>');

    return text;
  };

  EditorBlock.prototype.normalize = function editorBlockNormilize() {
    this.text = this.text;

    return this;
  };

  return EditorBlock;
})();