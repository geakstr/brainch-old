var Editor = require('./Editor');
var block = require('./editor/block').instance;

window.onload = function() {
  var edtr = new Editor(document.querySelector('#edtr'));

  edtr.model.pushBlock(block('- Расстановка запятых перед а, но.'));
  edtr.model.pushBlock(block('- Замена big трех точек на знак многоточия.'));
  edtr.model.pushBlock(block('Замена сдвоенных знаков препинания на одинарные.'));
  edtr.model.pushBlock(block('- Замена восклицательного знаков местами. Не big совсем верно, мы заменим'));
  edtr.model.pushBlock(block('Многоточие для обозначения big незаконченности высказывания с восклицательного знаков.'));
  edtr.model.pushBlock(block('- Добавление точки в конце последнего предложения (по умолчанию выключено).'));
  edtr.model.pushBlock(block('- Расстановка апострофа в английских и русских словах..'));
  edtr.model.pushBlock(block('Удаление повторяющихся знаков препинания (восклицательные, море точек — до многоточия)'));
};