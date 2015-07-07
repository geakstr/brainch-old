import * as utils from 'utils';
import Selection from './Selection';
import Model from './EditorModel';

export
default class {
  constructor(dom) {
    this.dom = dom;
    this.model = new Model(this.dom);

    this.preventDefault = false;

    this.eventsHandler();
  }

  onmousedown() {
    //console.log('onmousedown');
  }

  onmouseup() {
    //console.log('onmouseup');
  }

  onclick() {
    //console.log('onclick');
  }

  onkeydown(event) {
    this.preventDefault = false;

    var keyCode = event.keyCode;
    var keyChar = String.fromCharCode(keyCode).toLowerCase();

    var selection = Selection.info();
    if (selection === null) {
      event.preventDefault();
      return false;
    }

    if (keyCode === 13 || (keyChar === 'm' && event.ctrlKey)) {
      this.model.insertText(utils.cloneAssoc(selection));

      Selection.setCaretInNode(this.model.getBlock(selection.startI + 1).dom, 0);

      this.preventDefault = true;
    } else if (keyCode === 8 || keyCode === 46) {
      const caret = this.model.removeText(utils.cloneAssoc(selection), keyCode);

      Selection.setCaretInNode(this.model.getBlock(caret.blockIdx).dom, caret.offset);

      this.preventDefault = true;
    }

    if (this.preventDefault) {
      event.preventDefault();
    }

    return !this.preventDefault;
  }

  onkeyup(event) {
    if (this.preventDefault) {
      this.preventDefault = false;
      event.preventDefault();
      return false;
    }

    return true;
  }

  onkeypress() {
    //console.log('onkeypress');
  }

  onpaste() {
    //console.log('onpaste');
  }

  oncut() {
    //console.log('oncut');
  }

  eventsHandler() {
    this.dom.onmousedown = this.onmousedown.bind(this);
    this.dom.onmouseup = this.onmouseup.bind(this);
    this.dom.onclick = this.onclick.bind(this);
    this.dom.onkeydown = this.onkeydown.bind(this);
    this.dom.onkeyup = this.onkeyup.bind(this);
    this.dom.onkeypress = this.onkeypress.bind(this);
    this.dom.onpaste = this.onpaste.bind(this);
    this.dom.oncut = this.oncut.bind(this);
  }
}