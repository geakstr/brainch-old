import Editor from './Editor';

window.onload = () => {
  const edtr = new Editor(document.querySelector('#edtr'));

  edtr.model.pushBlock('one');
  edtr.model.pushBlock('two');
  edtr.model.pushBlock('three');

  edtr.model.insertBlockAt(0, 'four');
  edtr.model.insertBlockAt(2, 'five');
  edtr.model.insertBlockAt(0, 'six');
};