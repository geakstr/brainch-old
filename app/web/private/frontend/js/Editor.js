var commonutils = require('commonutils');
var Selection = require('./Selection');
var Model = require('./EditorModel');

module.exports = (function() {
  function Editor(dom) {
    this.dom = dom;
    this.model = new Model(this.dom);

    this.preventDefault = false;

    this.eventsHandler();
  }

  Editor.prototype.onmousedown = function editorOnmousedown() {
    //console.log('onmousedown');
  };

  Editor.prototype.onmouseup = function editorOnmouseup() {
    //console.log('onmouseup');
  };

  Editor.prototype.onclick = function editorOnclick() {
    //console.log('onclick');
  };

  Editor.prototype.onkeydown = function editorOnkeydown(event) {
    this.preventDefault = false;

    var keyCode = event.keyCode;
    var keyChar = String.fromCharCode(keyCode).toLowerCase();

    var selection = Selection.info();
    if (selection === null) {
      event.preventDefault();
      return false;
    }

    if (keyCode === 13 || (keyChar === 'm' && event.ctrlKey)) {
      this.model.insertText(commonutils.cloneAssoc(selection));

      Selection.setCaretInNode(this.model.getBlock(selection.startI + 1).dom, 0);

      this.preventDefault = true;
    } else if (keyCode === 8 || keyCode === 46) {
      var caret = this.model.removeText(commonutils.cloneAssoc(selection), keyCode);

      Selection.setCaretInNode(this.model.getBlock(caret.blockIdx).dom, caret.offset);

      this.preventDefault = true;
    }

    if (this.preventDefault) {
      event.preventDefault();
    }

    return !this.preventDefault;
  };

  Editor.prototype.onkeyup = function editorOnkeyup(event) {
    if (this.preventDefault) {
      this.preventDefault = false;
      event.preventDefault();
      return false;
    }

    return true;
  };

  Editor.prototype.onkeypress = function editorOnkeypress() {
    //console.log('onkeypress');
  };

  Editor.prototype.onpaste = function editorOnpaste() {
    //console.log('onpaste');
  };

  Editor.prototype.oncut = function editorOncut() {
    //console.log('oncut');
  };

  Editor.prototype.eventsHandler = function editorEventsHandler() {
    this.dom.onmousedown = this.onmousedown.bind(this);
    this.dom.onmouseup = this.onmouseup.bind(this);
    this.dom.onclick = this.onclick.bind(this);
    this.dom.onkeydown = this.onkeydown.bind(this);
    this.dom.onkeyup = this.onkeyup.bind(this);
    this.dom.onkeypress = this.onkeypress.bind(this);
    this.dom.onpaste = this.onpaste.bind(this);
    this.dom.oncut = this.oncut.bind(this);
  };

  return Editor;
})();