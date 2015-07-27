var commonutils = require('commonutils');
var Selection = require('./Selection');
var Model = require('./EditorModel');
var Keys = require('./Keys');
var Config = require('./Config');

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

    this.handleExtendedActions = handleExtendedActions;

    this.eventsHandler();
  }

  Editor.prototype.inputActions = {
    carriageReturn: function editorInputActionsCarriageReturn(selection) {
      this.model.insertText(selection, undefined);
      Selection.setCaretInNode(this.model.block(selection.startI + 1).dom, 0);
    },

    delete: function editorInputActionsDelete(selection) {
      var caret = this.model.removeText(selection, Keys.delete);
      Selection.setCaretInNode(this.model.block(caret.blockIdx).dom, caret.offset);
    },

    backspace: function editorInputActionsBackspace(selection) {
      var caret = this.model.removeText(selection, Keys.backspace);
      Selection.setCaretInNode(this.model.block(caret.blockIdx).dom, caret.offset);
    },

    tab: function editorInputActionsTab(selection) {
      this.model.insertText(selection, '\t');
      Selection.setCaretInNode(this.model.block(selection.startI).dom, selection.startPos + 1);
    },

    charUnderSelection: function editorInputActionsCharUnderSelection(selection) {
      this.model.removeText(selection);
      Selection.setCaretInNode(this.model.block(selection.startI).dom, selection.startPos);
    },

    justChar: function editorInputActionsJustChar(wasKeydown, wasKeypress, wasKeyup) {
      if (this.state.wasCut || this.state.wasCopy || this.state.wasPaste) {
        return;
      }

      if (this.dom.innerHTML.length === this.state.domInnerHTMLLength) {
        return;
      }

      this.state.domInnerHTMLLength = this.dom.innerHTML.length;

      var selection = Selection.info(this.model);
      if (selection === null) {
        return;
      }

      var block = this.model.block(selection.startI).normalize();
      Selection.setCaretInNode(block.dom, selection.startPos);
      var ch = block.text.substring(selection.startPos - 1, selection.startPos);

      if (Config.debug.on && Config.debug.verbose) {
        console.log(ch);
      }

      this.state.wasKeydown = wasKeydown;
      this.state.wasKeypress = wasKeypress;
      this.state.wasKeyup = wasKeyup;
    }
  };

  Editor.prototype.isInputAction = {
    carriageReturn: function editorIsInputActionCarriageReturn(event) {
      var keyChar = String.fromCharCode(event.which).toLowerCase();
      return event.which === Keys.enter || (keyChar === 'm' && event.ctrlKey);
    },

    delete: function editorIsInputActionDelete(event) {
      return event.which === Keys.delete;
    },

    backspace: function editorIsInputActionBackspace(event) {
      return event.which === Keys.backspace;
    },

    tab: function editorIsInputActionTab(event) {
      return event.which === Keys.tab && !event.shiftKey;
    },

    charUnderSelection: function editorIsInputActionCharUnderSelection(event, selection) {
      return selection.startI < selection.endI && this.isEvent.characterKeyPress(event);
    },

    handled: function editorIsUnputActionHandled(event) {
      return this.handleExtendedActions && !this.isEvent.characterKeyPress(event) &&
        !this.isEvent.navigationKeyPress(event) && !this.isEvent.editingKeypress(event);
    }
  };

  Editor.prototype.isEvent = {
    characterKeyPress: function editorIsEventCharacterKeyPress(event) {
      var keyCode = event.which;
      if (typeof keyCode === 'number' && keyCode > 0) {
        return !event.ctrlKey && !event.metaKey && this.isHandledKey(keyCode);
      }

      return false;
    },

    navigationKeyPress: function editorIsEventNavigationKeyPress(event) {
      var keyCode = event.which;
      var isArrow = (keyCode === Keys.up ||
        keyCode === Keys.down ||
        keyCode === Keys.left ||
        keyCode === Keys.right);

      return (isArrow && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) ||
        (isArrow && (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey));
    },

    editingKeypress: function editorIsEventEditingKeyPress(event) {
      var keyCode = event.which;
      var keyChar = String.fromCharCode(keyCode).toLowerCase();

      return (keyChar === 'a' && (event.metaKey || event.ctrlKey));
    },

    handledKey: function editorIsEventHandledKey(keyCode) {
      for (var handledKey in Keys) {
        if (keyCode === Keys[handledKey]) {
          return false;
        }
      }

      return true;
    }
  };

  Editor.prototype.events = {
    keydown: function editorEventsKeydown(event) {
      if (Config.debug.on && Config.debug.events) {
        console.log('keydown');
      }

      this.state.preventDefault = false;

      var selection = Selection.info(this.model);
      if (selection !== null) {
        this.state.preventDefault = true;

        if (this.isInputAction.carriageReturn.call(this, event)) {
          this.inputActions.carriageReturn.call(this, selection);
        } else if (this.isInputAction.delete.call(this, event)) {
          this.inputActions.delete.call(this, selection);
        } else if (this.isInputAction.backspace.call(this, event)) {
          this.inputActions.backspace.call(this, selection);
        } else if (this.isInputAction.tab.call(this, event)) {
          this.inputActions.tab.call(this, selection);
        } else if (this.isInputAction.charUnderSelection.call(this, event, selection)) {
          this.inputActions.charUnderSelection.call(this, selection);
          this.state.preventDefault = false;
        } else if (this.isInputAction.handled.call(this, event)) {
          this.state.preventDefault = false;
          return false;
        } else {
          this.state.preventDefault = false;
        }

      }

      if (this.state.preventDefault) {
        event.preventDefault();
      } else {
        if (this.state.wasKeydown || this.state.wasKeypress) {
          this.inputActions.justChar.call(this, true, false, false);
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
    },

    keypress: function editorEventsKeypress(event) {
      if (Config.debug.on && Config.debug.events) {
        console.log('keypress');
      }

      if (this.state.wasKeypress) {
        this.inputActions.justChar.call(this, false, true, false);
      }

      return true;
    },

    keyup: function editorEventsKeyup(event) {
      if (Config.debug.on && Config.debug.events) {
        console.log('keyup');
      }

      if (this.state.preventDefault) {
        this.state.preventDefault = false;
        event.preventDefault();
        return false;
      }

      this.state.preventDefault = false;

      if (this.state.wasKeydown || !this.state.wasKeypress) {
        this.inputActions.justChar.call(this, false, false, true);
      }

      return true;
    },

    paste: function editorEventsPaste(event) {
      if (Config.debug.on && Config.debug.events) {
        console.log('onpaste');
      }

      this.state.wasCopy = false;
      this.state.wasPaste = true;
      this.state.wasCut = false;
      this.state.preventDefault = true;
      event.preventDefault();

      var selection = Selection.info(this.model);
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
        this.model.insertText(selection, blocks[0]);
      } else {
        if (!selection.isRange && selection.startPos === 0 && selection.startI === 0) {
          commonutils.range(blocksLen - 1, function(i) {
            this.model.insertBlockAt(selection.startI, blocks[i]);
            selection.startI++;
            selection.endI++;
          }, this);

          this.model.insertText(selection, blocks[blocksLen - 1]);
        } else if (!selection.isRange && selection.endPos === endText.length &&
          selection.endI === this.model.size() - 1) {
          this.model.insertText(selection, blocks[0]);

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
    },

    cut: function editorEventsCut(event) {
      if (Config.debug.on && Config.debug.events) {
        console.log('oncut');
      }

      this.state.wasCopy = false;
      this.state.wasPaste = false;
      this.state.wasCut = true;
      this.state.preventDefault = true;
      event.preventDefault();

      var selection = Selection.info(this.model);
      if (selection === null) {
        return false;
      }

      var startBlock = this.model.block(selection.startI);
      var endBlock = this.model.block(selection.endI);

      var startText = startBlock.text;
      var endText = endBlock.text;

      var text = '';
      if (selection.startI === selection.endI) {
        text = startText.substring(selection.startPos, selection.endPos);
      } else {
        text = startText.substring(selection.startPos) + '\n';

        commonutils.range(selection.startI + 1, selection.endI, function(i) {
          text += this.model.block(i).text + '\n';
        }, this);

        text += endText.substring(0, selection.endPos);
      }

      event.clipboardData.setData('text/plain', text);

      this.model.removeText(selection);
      Selection.setCaretInNode(startBlock.dom, selection.startPos);
      return false;
    },

    copy: function editorEventsCopy(event) {
      if (Config.debug.on && Config.debug.events) {
        console.log('oncopy');
      }

      this.state.wasCopy = true;
      this.state.wasPaste = false;
      this.state.wasCut = false;
      this.state.preventDefault = true;
      event.preventDefault();

      var selection = Selection.info(this.model);
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
    }
  };

  Editor.prototype.eventsHandler = function editorEventsHandler() {
    this.dom.onkeydown = this.events.keydown.bind(this);
    this.dom.onkeyup = this.events.keyup.bind(this);
    this.dom.onkeypress = this.events.keypress.bind(this);
    this.dom.onpaste = this.events.paste.bind(this);
    this.dom.oncut = this.events.cut.bind(this);
    this.dom.oncopy = this.events.copy.bind(this);
  };

  return Editor;
})();