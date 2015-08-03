'use strict';

var block = require('common/editor/model/block').factory;

window.onload = function() {
  var editor;

  editor = require('frontend/editor')(document.querySelector('#editor'));

  editor.model.push(block('- Расстановка запятых перед а, но.'));
  editor.model.push(block('- Замена big трех точек на знак многоточия.'));
  editor.model.push(block('Замена сдвоенных знаков препинания на одинарные.'));
  editor.model.push(block('- Замена восклицательного знаков местами. Не big совсем верно, мы заменим'));
  editor.model.push(block('Многоточие для обозначения big незаконченности высказывания с восклицательного знаков.'));
  editor.model.push(block('- Добавление точки в конце последнего предложения (по умолчанию выключено).'));
  editor.model.push(block('- Расстановка апострофа в английских и русских словах..'));
  editor.model.push(block('Удаление повторяющихся знаков препинания (восклицательные, море точек — до многоточия)'));
};