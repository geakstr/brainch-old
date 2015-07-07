export
default class {
  constructor(text) {
    this.dom = this.createDom(text);
    this.i = 0;
  }

  set i(i) {
    this.dom.setAttribute('data-i', i);
  }

  createDom(text) {
    const dom = document.createElement('p');

    dom.classList.add('blck');
    dom.innerHTML = text.length === 0 ? '<br>' : text;

    return dom;
  }
}