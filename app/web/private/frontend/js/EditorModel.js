import Immutable from 'Immutable';

export
default class {
  constructor() {
    this.historyIdx = 0;
    this.history = [Immutable.List([])];
    this.annotations = [];
  }

  operation(fn, annotation) {
    this.historyIdx++;

    this.history = this.history.slice(0, this.historyIdx);
    this.annotations = this.annotations.slice(0, this.historyIdx);

    this.history.push(fn(history[this.historyIdx - 1]));
    this.annotations.push(annotation);
  }
}