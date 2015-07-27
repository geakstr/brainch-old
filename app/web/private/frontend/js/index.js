var Editor = require('./Editor');

window.onload = function() {
  var edtr = new Editor(document.querySelector('#edtr'));

  edtr.model.pushBlock('- Расстановка запятых перед а, но.');
  edtr.model.pushBlock('- Замена big трех точек на знак многоточия.');
  edtr.model.pushBlock('Замена сдвоенных знаков препинания на одинарные.');
  edtr.model.pushBlock('- Замена восклицательного и вопросительного знаков местами. Не big совсем верно, мы заменим');
  edtr.model.pushBlock('Многоточие для обозначения big незаконченности высказывания с восклицательного знаков.');
  edtr.model.pushBlock('- Добавление точки в конце последнего предложения (по умолчанию выключено).');
  edtr.model.pushBlock('- Расстановка апострофа в английских и русских словах.');
  edtr.model.pushBlock('Удаление повторяющихся знаков препинания (восклицательные и трех море точек — до многоточия).');
};