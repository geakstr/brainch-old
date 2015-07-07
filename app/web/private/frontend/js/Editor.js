import Selection from './Selection';
import Model from './EditorModel';

export
default class {
  constructor(dom) {
    this.dom = dom;
    this.model = new Model(this.dom);

    this.eventsHandler();
  }

  onmousedown() {
    console.log('onmousedown');
  }

  onmouseup() {
    console.log('onmouseup');
  }

  onclick() {
    console.log('onclick');
  }

  onkeydown() {
    console.log('onkeydown');
  }

  onkeyup() {
    console.log('onkeyup');
  }

  onkeypress() {
    console.log('onkeypress');
  }

  onpaste() {
    console.log('onpaste');
  }

  oncut() {
    console.log('oncut');
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