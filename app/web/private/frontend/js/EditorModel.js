var Block = require('./EditorBlock');

module.exports = (function() {
  function EditorModel(parentDom) {
    this.parentDom = parentDom;

    this.blocks = [];

    this.historyIdx = 0;
    this.history = [];
  }

  EditorModel.prototype.size = function editorModelSize() {
    return this.blocks.length;
  };

  EditorModel.prototype.block = function editorModelBlock(i) {
    return this.blocks[i];
  };

  EditorModel.prototype.last = function editorModelLast() {
    return this.blocks[this.size() - 1];
  };

  EditorModel.prototype.pushBlock = function editorModelPushBlock(block) {
    return this.insertBlockAt(this.parentDom.childNodes.length, block);
  };

  EditorModel.prototype.insertBlockAt = function editorModelInsertBlockAt(i, block) {
    if (typeof block === 'string') {
      block = new Block(block, this.blocks);
    } else if (typeof block === 'undefined') {
      block = new Block('', this.blocks);
    }

    block.i = i;

    this._splice(i, 0, block);
    this.parentDom.insertBefore(block.dom, this.parentDom.childNodes[i]);
    this._updateBlockIndicesFrom(i + 1);

    return block;
  };

  EditorModel.prototype.removeBlock = function editorModelRemoveBlock(idx) {
    this.removeBlocksRange(idx, idx);
  };

  EditorModel.prototype.removeBlocksRange = function editorModelRemoveBlocksRange(from, to) {
    this._splice(from, to - from + 1);
    this._updateBlockIndicesFrom(from);
  };

  EditorModel.prototype.removeBlocksByIndices = function editorModelRemoveBlocksByIndices(indices) {
    indices.sort(function(a, b) {
      return a - b;
    });

    var from = indices[0];

    if (indices.length === 2 && indices[1] - 1 === from) {
      this._splice(from, indices[1] - from + 1);
    } else {
      indices.forEach(function(x, i) {
        this._splice(x - i, 1);
      }, this);
    }

    this._updateBlockIndicesFrom(from);

    return this;
  };

  EditorModel.prototype.insertText = function editorModelInsertText(selection, text) {
    var startBlock = this.blocks[selection.startI];
    var endBlock = this.blocks[selection.endI];

    var startText = startBlock.text.substring(0, selection.startPos);
    var endText = endBlock.text.substring(selection.endPos);

    startBlock.text = startText;
    if (selection.isRange) {
      this.removeBlocksRange(selection.startI + 1, selection.endI);
    }

    if (typeof text === 'undefined') { // this means was carriage return
      this.insertBlockAt(selection.startI + 1, endText);
    } else {
      startBlock.text += text + endText;
    }
  };

  EditorModel.prototype.removeText = function editorModelRemoveText(selection, keyCode) {
    if (typeof keyCode === 'undefined') {
      keyCode = 8;
    }

    var backspaceOffset = (keyCode === 8) ? -1 : 0;
    var deleteOffset = (keyCode === 46) ? 1 : 0;

    var caret = {
      blockIdx: selection.startI,
      offset: selection.startPos
    };

    var startBlock = this.blocks[selection.startI];
    var endBlock = this.blocks[selection.endI];

    var startText = startBlock.text;
    var endText = endBlock.text;

    if (!selection.isRange && keyCode === 8 && selection.startPos === 0) {
      if (selection.startI === 0) {
        return caret;
      }

      startBlock = this.blocks[--selection.startI];
      startText = startBlock.text;

      backspaceOffset = 0;

      caret.blockIdx = selection.startI;
      caret.offset = startText.length;

      this.removeBlock(selection.endI);
    } else if (!selection.isRange && keyCode === 46 && endText.length === selection.endPos) {
      if (selection.endI === this.blocks.length - 1) {
        return caret;
      }

      endBlock = this.blocks[++selection.endI];
      endText = endBlock.text;

      this.removeBlock(selection.endI);
    } else {
      if (selection.isRange) {
        backspaceOffset = 0;
        deleteOffset = 0;

        this.removeBlocksRange(selection.startI + 1, selection.endI);
      }

      startText = startText.substring(0, selection.startPos + backspaceOffset);
      endText = endText.substring(selection.endPos + deleteOffset);
    }

    startBlock.text = startText + endText;

    caret.offset += backspaceOffset;

    return caret;
  };

  EditorModel.prototype.saveToHistory = function editorModelSaveToHistory(action) {
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(action(history[this.historyIdx]));
    this.historyIdx++;
  };

  EditorModel.prototype._splice = function editorModelSplice(i, n, block) {
    var ret = [];

    if (typeof block === 'undefined') {
      ret = this.blocks.splice(i, n);
      ret.forEach(function(x) {
        if (this.parentDom.contains(x.dom)) {
          this.parentDom.removeChild(x.dom);
        }
      }, this);
    } else {
      this.blocks.splice(i, n, block);
    }

    return ret;
  };

  EditorModel.prototype._updateBlockIndicesFrom = function editorModelUpdateBlockIndicesFrom(from) {
    for (var i = from; i < this.blocks.length; i++) {
      this.blocks[i].i = i;
    }
  };

  return EditorModel;
})();