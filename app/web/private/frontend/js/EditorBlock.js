export
default class {
  constructor(text) {
    this.dom = document.createElement('p');
    this.text = text;
    this.type = this.text;
    this.i = 0;

    const _this = this;
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        _this.type = _this.text;
      });
    });

    this.observer.observe(this.dom, {
      characterData: true,
      subtree: true
    });
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

  set type(text) {
    this.dom.className = 'blck';

    if (text.trim()[0] === '-') {
      this.dom.classList.add('task');
    } else {
      this.dom.classList.add('note');
    }
  }

  stopObserve() {
    this.observer.disconnect();
  }
}