var Editor = require('./Editor');
var block = require('./editor/block').factory;

window.onload = function() {
  var edtr = new Editor(document.querySelector('#edtr'));

  edtr.model.pushBlock(block({
    text: '- Расстановка запятых перед а, но.'
  }));
  edtr.model.pushBlock(block({
    text: '- Замена big трех точек на знак многоточия.'
  }));
  edtr.model.pushBlock(block({
    text: 'Замена сдвоенных знаков препинания на одинарные.'
  }));
  edtr.model.pushBlock(block({
    text: '- Замена восклицательного и вопросительного знаков местами. Не big совсем верно, мы заменим'
  }));
  edtr.model.pushBlock(block({
    text: 'Многоточие для обозначения big незаконченности высказывания с восклицательного знаков.'
  }));
  edtr.model.pushBlock(block({
    text: '- Добавление точки в конце последнего предложения (по умолчанию выключено).'
  }));
  edtr.model.pushBlock(block({
    text: '- Расстановка апострофа в английских и русских словах..'
  }));
  edtr.model.pushBlock(block({
    text: 'Удаление повторяющихся знаков препинания (восклицательные и трех море точек — до многоточия).'
  }));
};