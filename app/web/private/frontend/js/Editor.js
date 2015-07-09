var commonutils = require('commonutils');
var Selection = require('./Selection');
var Model = require('./EditorModel');

module.exports = (function() {
  function Editor(dom) {
    this.dom = dom;
    this.model = new Model(this.dom);

    this.prevState = {
      preventDefault: false
    };

    this.eventsHandler();
  }

  Editor.handledKeys = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pausebreak: 19,
    capslock: 20,
    escape: 27,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    insert: 45,
    delete: 46,
    leftwindowkey: 91,
    rightwindowkey: 92,
    selectkey: 93,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numlock: 144,
    scrolllock: 145
  };

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
    // console.log('keydown');
    this.prevState.preventDefault = false;

    var keyCode = event.keyCode;
    var keyChar = String.fromCharCode(keyCode).toLowerCase();

    var caret = null;
    var selection = Selection.info();
    if (selection === null) {
      event.preventDefault();
      this.prevState.preventDefault = true;
      return false;
    } else if (selection.allBlocksSelected) {
      selection.startI = 0;
      selection.endI = this.model.blocks.length - 1;
      selection.startPos = 0;
      selection.endPos = this.model.blocks[selection.endI].text.length;
      selection.isRange = true;
    }

    if (keyCode === Editor.handledKeys.enter || (keyChar === 'm' && event.ctrlKey)) {
      this.model.insertText(commonutils.cloneAssoc(selection));

      Selection.setCaretInNode(this.model.getBlock(selection.startI + 1).dom, 0);

      this.prevState.preventDefault = true;
    } else if (keyCode === Editor.handledKeys.backspace || keyCode === Editor.handledKeys.delete) {
      caret = this.model.removeText(commonutils.cloneAssoc(selection), keyCode);

      Selection.setCaretInNode(this.model.getBlock(caret.blockIdx).dom, caret.offset);

      this.prevState.preventDefault = true;
    } else if (selection.startI < selection.endI && this.isCharacterKeyPress(event)) {
      this.model.removeText(commonutils.cloneAssoc(selection));
      Selection.setCaretInNode(this.model.getBlock(selection.startI).dom, selection.startPos);
    }

    if (this.prevState.preventDefault) {
      event.preventDefault();
    }

    return !this.prevState.preventDefault;
  };

  Editor.prototype.isCharacterKeyPress = function editorIsCharacterKeyPress(event) {
    var keyCode = event.which;
    if (typeof keyCode === 'undefined') {
      return true;
    } else if (typeof keyCode === 'number' && keyCode > 0) {
      return !event.ctrlKey && !event.metaKey && this.isHandledKey(keyCode);
    }

    return false;
  };

  Editor.prototype.isHandledKey = function editorIsHandledKey(keyCode) {
    for (var key in Editor.handledKeys) {
      if (keyCode === Editor.handledKeys[key]) {
        return false;
      }
    }

    return true;
  };

  Editor.prototype.onkeyup = function editorOnkeyup(event) {
    // console.log('keyup');
    if (this.prevState.preventDefault) {
      this.prevState.preventDefault = false;
      event.preventDefault();
      return false;
    }

    this.prevState.preventDefault = false;

    return true;
  };

  Editor.prototype.onkeypress = function editorOnkeypress(event) {
    // console.log('keypress');
    return true;
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