'use strict';

var app = require('brainch-frontend/app');

module.exports = function(container) {
  var that;

  require('brainch-frontend/networking/sjs')(function(onopen) {
    var doc;

    doc = app.api.sjs.get('docs', 'first');
    doc.subscribe();
    doc.whenReady(function() {
      if (!doc.type || doc.type.name !== 'text') {
        var t = '- Расстановка запятых перед а, но.\n';
        t += '- Замена big трех точек на знак многоточия.\n';
        t += 'Замена сдвоенных знаков препинания на одинарные.\n';
        t += '- Замена восклицательного знаков местами. Не big совсем верно, мы заменим\n';
        t += 'Многоточие для обозначения незаконченности высказывания с восклицательного знаков.\n';
        t += '- Добавление точки в конце последнего предложения (по умолчанию выключено).\n';
        t += '- Расстановка апострофа в английских и русских словах..\n';
        t += 'Удаление повторяющихся знаков препинания (восклицательные море точек до многоточия)';
        doc.create('text', t + '\n');
      }
      onopen(doc);
    });
  }, function(doc) {
    app.editor.container = container;
    app.editor.container.setAttribute('spellcheck', false);
    app.editor.container.setAttribute('contenteditable', true);

    app.editor.ot = require('brainch-frontend/editor/ot')(doc);
    app.editor.ot.can_op = false;

    app.editor.model = require('brainch-frontend/editor/model')(doc.getSnapshot());
    app.editor.state.container.html.length = app.editor.container.innerHTML.length;

    app.editor.events = require('brainch-frontend/editor/actions/events')();
    app.editor.container.addEventListener('keydown', app.editor.events.keydown);
    app.editor.container.addEventListener('keyup', app.editor.events.keyup);
    app.editor.container.addEventListener('paste', app.editor.events.paste);
    app.editor.container.addEventListener('cut', app.editor.events.cut);
    app.editor.container.addEventListener('copy', app.editor.events.copy);
  });

  that = {};

  return that;
};