import Block from './EditorBlock';

export
default class {
  constructor(parentDom) {
    this.parentDom = parentDom;

    this.blocks = [];

    this.historyIdx = 0;
    this.history = [];
  }

  getBlock(i) {
    return this.blocks[i];
  }

  pushBlock(block) {
    return this.insertBlockAt(this.parentDom.childNodes.length, block);
  }

  insertBlockAt(i, block) {
    if (typeof block === 'string') {
      block = new Block(block);
    } else if (typeof block === 'undefined') {
      block = new Block('');
    }

    block.i = i;

    this._splice(i, 0, block);
    this.parentDom.insertBefore(block.dom, this.parentDom.childNodes[i]);
    this._updateBlockIndicesFrom(i + 1);

    return block;
  }

  removeBlock(idx) {
    this.removeBlocksRange(idx, idx);
  }

  removeBlocksRange(from, to) {
    this._splice(from, to - from + 1);
    this._updateBlockIndicesFrom(from);
  }

  removeBlocksByIndices(indices) {
    indices.sort((a, b) => a - b);

    const from = indices[0];

    if (indices.length === 2 && indices[1] - 1 === from) {
      this._splice(from, indices[1] - from + 1);
    } else {
      indices.forEach((x, i) => this._splice(x - i, 1), this);
    }

    this._updateBlockIndicesFrom(from);

    return this;
  }

  insertText(selection, text) {
    const startBlock = this.blocks[selection.startI];
    const endBlock = this.blocks[selection.endI];

    const startText = startBlock.text.substring(0, selection.startPos);
    const endText = endBlock.text.substring(selection.endPos);

    startBlock.text = startText;
    if (selection.isRange) {
      this.removeBlocksRange(selection.startI + 1, selection.endI);
    }

    if (typeof text === 'undefined') { // this means was carriage return
      this.insertBlockAt(selection.startI + 1, endText);
    } else {
      startBlock.text += text + endText;
    }
  }

  removeText(selection, keyCode) {
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
  }

  saveActionToHistory(action) {
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(action(history[this.historyIdx]));
    this.historyIdx++;
  }

  _splice(i, n, block) {
    let ret = [];

    if (typeof block === 'undefined') {
      ret = this.blocks.splice(i, n);
      ret.forEach(x => this.parentDom.removeChild(x.dom), this);
    } else {
      this.blocks.splice(i, n, block);
    }

    return ret;
  }

  _updateBlockIndicesFrom(from) {
    for (let i = from; i < this.blocks.length; i++) {
      this.blocks[i].i = i;
    }
  }
}