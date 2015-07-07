import Block from './EditorBlock';

export
default class {
  constructor(parentDom) {
    this.parentDom = parentDom;

    this.blocks = [];

    this.historyIdx = 0;
    this.history = [];
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
      let subtractor = 0;
      indices.forEach(x => this._splice(x - subtractor++, 1), this);
    }

    this._updateBlockIndicesFrom(from);

    return this;
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