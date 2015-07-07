export
default class {
  constructor(text) {
    this.dom = document.createElement('p');
    this.dom.classList.add('blck');
    this.i = 0;
    this.text = text;
  }

  set i(i) {
    this.dom.setAttribute('data-i', i);
  }

  set text(text) {
    this.dom.innerHTML = text.length === 0 ? '<br>' : text;
  }

  get text() {
    return this.dom.textContent;
  }
}