var commonutils = require('commonutils');
var Selection = require('./Selection');
var Model = require('./EditorModel');

module.exports = (function() {
  function Editor(dom, handleExtendedActions) {
    this.dom = dom;
    this.dom.setAttribute('spellcheck', false);
    this.dom.setAttribute('contenteditable', true);

    this.model = new Model(this.dom);

    this.state = {
      preventDefault: false,
      domInnerHTMLLength: this.dom.innerHTML.length,
      wasKeydown: false,
      wasKeypress: false,
      wasKeyup: false,
      wasCut: false,
      wasPaste: false,
      wasCopy: false
    };

    this.debug = {
      debug: true,
      events: false
    };

    this.handleExtendedActions = handleExtendedActions;

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

  Editor.prototype.processInputChar = function editorProcessInputChar(wasKeydown, wasKeypress, wasKeyup) {
    if (this.state.wasCut || this.state.wasCopy || this.state.wasPaste) {
      return;
    }

    if (this.dom.innerHTML.length === this.state.domInnerHTMLLength) {
      return;
    }

    this.state.domInnerHTMLLength = this.dom.innerHTML.length;

    var selection = Selection.info(this.model.size() - 1, this.model.last().length);
    if (selection === null) {
      return;
    }

    var block = this.model.block(selection.startI).normalize();
    Selection.setCaretInNode(block.dom, selection.startPos);

    var ch = block.text.substring(selection.startPos - 1, selection.startPos);
    if (this.debug.debug) {
      console.log(ch);
    }

    this.wasKeydown = wasKeydown;
    this.state.wasKeypress = wasKeypress;
    this.state.wasKeyup = wasKeyup;
  };

  Editor.prototype.onkeydown = function editorOnkeydown(event) {
    if (this.debug.debug && this.debug.events) {
      console.log('keydown');
    }
    this.state.preventDefault = false;

    var keyCode = event.which;

    var caret = null;
    var selection = Selection.info(this.model.size() - 1, this.model.last().length);
    if (selection === null) {
      event.preventDefault();
      this.state.preventDefault = true;
      return false;
    }

    if (this.isCarriageReturn(event)) {
      this.model.insertText(commonutils.cloneAssoc(selection));
      Selection.setCaretInNode(this.model.block(selection.startI + 1).dom, 0);
      this.state.preventDefault = true;
    } else if (this.isDeleteAction(event)) {
      caret = this.model.removeText(commonutils.cloneAssoc(selection), keyCode);
      Selection.setCaretInNode(this.model.block(caret.blockIdx).dom, caret.offset);
      this.state.preventDefault = true;
    } else if (keyCode === Editor.handledKeys.tab) {
      if (!event.shiftKey) {
        this.model.insertText(commonutils.cloneAssoc(selection), '\t');
        Selection.setCaretInNode(this.model.block(selection.startI).dom, selection.startPos + 1);
      }

      this.state.preventDefault = true;

      // Input when selected several blocks
    } else if (selection.startI < selection.endI && this.isCharacterKeyPress(event)) {
      this.model.removeText(commonutils.cloneAssoc(selection));
      Selection.setCaretInNode(this.model.block(selection.startI).dom, selection.startPos);
    } else if (this.handleExtendedActions &&
      !this.isCharacterKeyPress(event) &&
      !this.isNavigationKeyPress(event) &&
      !this.isEditingKeypress(event)) {
      return false;
    }

    if (this.state.preventDefault) {
      event.preventDefault();
    } else {
      if (this.state.wasKeydown || this.state.wasKeypress) {
        this.processInputChar(true, false, false);
      }
    }

    this.state.wasKeydown = true;
    this.state.wasKeypress = false;
    this.state.wasKeyup = false;
    this.state.wasCopy = false;
    this.state.wasPaste = false;
    this.state.wasCut = false;
    this.state.domInnerHTMLLength = this.dom.innerHTML.length;

    return !this.state.preventDefault;
  };

  Editor.prototype.onkeypress = function editorOnkeypress(event) {
    if (this.debug.debug && this.debug.events) {
      console.log('keypress');
    }
    if (this.state.wasKeypress) {
      this.processInputChar(false, true, false);
    }

    return true;
  };

  Editor.prototype.onkeyup = function editorOnkeyup(event) {
    if (this.debug.debug && this.debug.events) {
      console.log('keyup');
    }
    if (this.state.preventDefault) {
      this.state.preventDefault = false;
      event.preventDefault();
      return false;
    }

    this.state.preventDefault = false;

    if (this.state.wasKeydown || !this.state.wasKeypress) {
      this.processInputChar(false, false, true);
    }

    return true;
  };

  Editor.prototype.onpaste = function editorOnpaste(event) {
    if (this.debug.debug && this.debug.events) {
      console.log('onpaste');
    }
    this.state.wasCopy = false;
    this.state.wasPaste = true;
    this.state.wasCut = false;
    this.state.preventDefault = true;
    event.preventDefault();

    var selection = Selection.info(this.model.size() - 1, this.model.last().length);
    if (selection === null) {
      return false;
    }

    var pasted = event.clipboardData.getData('text/plain');
    var blocks = pasted.split('\n');
    var blocksLen = blocks.length;
    var offset = selection.startPos + pasted.length;

    var startBlock = this.model.block(selection.startI);
    var endBlock = this.model.block(selection.endI);

    var startText = startBlock.text;
    var endText = endBlock.text;

    if (blocksLen === 0) {
      return false;
    } else if (blocksLen === 1) {
      this.model.insertText(commonutils.cloneAssoc(selection), blocks[0]);
    } else {
      if (!selection.isRange && selection.startPos === 0 && selection.startI === 0) {
        commonutils.range(blocksLen - 1, function(i) {
          this.model.insertBlockAt(selection.startI, blocks[i]);
          selection.startI++;
          selection.endI++;
        }, this);

        this.model.insertText(commonutils.cloneAssoc(selection), blocks[blocksLen - 1]);
      } else if (!selection.isRange && selection.endPos === endText.length &&
        selection.endI === this.model.size() - 1) {
        this.model.insertText(commonutils.cloneAssoc(selection), blocks[0]);

        commonutils.range(1, blocksLen, function(i) {
          this.model.insertBlockAt(++selection.startI, blocks[i]);
        }, this);
      } else {
        startText = startText.substring(0, selection.startPos);
        endText = endText.substring(selection.endPos);

        startBlock.text = startText + blocks[0];

        if (selection.isRange) {
          this.model.removeBlocksRange(selection.startI + 1, selection.endI);
        }

        commonutils.range(1, blocksLen - 1, function(i) {
          this.model.insertBlockAt(++selection.startI, blocks[i]);
        }, this);

        this.model.insertBlockAt(++selection.startI, blocks[blocksLen - 1] + endText);
      }

      offset = blocks[blocksLen - 1].length;
    }

    Selection.setCaretInNode(this.model.block(selection.startI).dom, offset);

    return false;
  };

  Editor.prototype.oncut = function editorOncut(event) {
    if (this.debug.debug && this.debug.events) {
      console.log('oncut');
    }
    this.state.wasCopy = false;
    this.state.wasPaste = false;
    this.state.wasCut = true;
    this.state.preventDefault = true;
    event.preventDefault();

    var selection = Selection.info(this.model.size() - 1, this.model.last().length);
    if (selection === null) {
      return false;
    }

    var text = '';
    if (selection.startI === selection.endI) {
      text = this.model.block(selection.startI).text.substring(selection.startPos, selection.endPos);
    } else {
      text = this.model.block(selection.startI).text.substring(selection.startPos) + '\n';

      commonutils.range(selection.startI + 1, selection.endI, function(i) {
        text += this.model.block(i).text + '\n';
      }, this);

      text += this.model.block(selection.endI).text.substring(0, selection.endPos);
    }

    event.clipboardData.setData('text/plain', text);

    this.model.removeText(commonutils.cloneAssoc(selection));
    Selection.setCaretInNode(this.model.block(selection.startI).dom, selection.startPos);
    return false;
  };

  Editor.prototype.oncopy = function editorOncopy(event) {
    if (this.debug.debug && this.debug.events) {
      console.log('oncopy');
    }
    this.state.wasCopy = true;
    this.state.wasPaste = false;
    this.state.wasCut = false;
    this.state.preventDefault = true;
    event.preventDefault();

    var selection = Selection.info(this.model.size() - 1, this.model.last().length);
    if (selection === null) {
      return false;
    }

    var startBlock = this.model.block(selection.startI);
    var endBlock = this.model.block(selection.endI);

    var startText = startBlock.text;
    var endText = endBlock.text;

    var text = '';
    if (selection.startI === selection.endI) {
      text += startText.substring(selection.startPos, selection.endPos);
    } else {
      text += startText.substring(selection.startPos) + '\n';

      commonutils.range(selection.startI + 1, selection.endI, function(i) {
        text += this.model.block(i).text + '\n';
      }, this);

      text += endText.substring(0, selection.endPos);
    }

    event.clipboardData.setData('text/plain', text);

    return false;
  };

  Editor.prototype.isCharacterKeyPress = function editorIsCharacterKeyPress(event) {
    var keyCode = event.which;
    if (typeof keyCode === 'number' && keyCode > 0) {
      return !event.ctrlKey && !event.metaKey && this.isHandledKey(keyCode);
    }

    return false;
  };

  Editor.prototype.isNavigationKeyPress = function editorIsNavigationKeyPress(event) {
    var keyCode = event.which;
    var isArrow = (keyCode === Editor.handledKeys.up ||
      keyCode === Editor.handledKeys.down ||
      keyCode === Editor.handledKeys.left ||
      keyCode === Editor.handledKeys.right);

    return (isArrow && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) ||
      (isArrow && (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey));
  };

  Editor.prototype.isEditingKeypress = function editorIsEditingKeyPress(event) {
    var keyCode = event.which;
    var keyChar = String.fromCharCode(keyCode).toLowerCase();

    return (keyChar === 'a' && (event.metaKey || event.ctrlKey));
  };

  Editor.prototype.isHandledKey = function editorIsHandledKey(keyCode) {
    for (var handledKey in Editor.handledKeys) {
      if (keyCode === Editor.handledKeys[handledKey]) {
        return false;
      }
    }

    return true;
  };

  Editor.prototype.isCarriageReturn = function editorIsCarriageReturn(event) {
    var keyCode = event.which;
    var keyChar = String.fromCharCode(keyCode).toLowerCase();
    return keyCode === Editor.handledKeys.enter || (keyChar === 'm' && event.ctrlKey);
  };

  Editor.prototype.isDeleteAction = function editorIsDeleteAction(event) {
    var keyCode = event.which;
    return keyCode === Editor.handledKeys.backspace || keyCode === Editor.handledKeys.delete;
  };

  Editor.prototype.eventsHandler = function editorEventsHandler() {
    this.dom.onkeydown = this.onkeydown.bind(this);
    this.dom.onkeyup = this.onkeyup.bind(this);
    this.dom.onkeypress = this.onkeypress.bind(this);
    this.dom.onpaste = this.onpaste.bind(this);
    this.dom.oncut = this.oncut.bind(this);
    this.dom.oncopy = this.oncopy.bind(this);
  };

  return Editor;
})();