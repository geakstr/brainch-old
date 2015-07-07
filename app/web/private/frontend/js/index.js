import Editor from './Editor';

window.onload = () => {
  const edtr = new Editor(document.querySelector('#edtr'));

  edtr.model.pushBlock('this is the big big text');
  edtr.model.pushBlock('two');
  edtr.model.pushBlock('three');

  edtr.model.insertBlockAt(0, 'four');
  edtr.model.insertBlockAt(2, 'five');
  edtr.model.insertBlockAt(0, 'six');

  //edtr.model.removeBlocksByIndices([0, 1, 5]);
};