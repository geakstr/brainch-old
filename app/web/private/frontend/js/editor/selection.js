'use strict';

var utils = require('common/utils');
var selection = require('common/editor/selection');

exports.get = function(model) {
  var s = window.getSelection();

  if (!s.anchorNode || !s.focusNode) {
    throw utils.exceptions['editor selection error']();
  }

  var anchor = s.anchorNode;
  var focus = s.focusNode;

  var info = selection.build(model);

  if (anchor.id !== 'editor' && focus.id !== 'editor') {
    while (anchor.parentNode !== null &&
      (anchor.nodeType !== 1 || !anchor.classList.contains('block'))) {
      anchor = anchor.parentNode;
    }

    while (focus.parentNode !== null &&
      (focus.nodeType !== 1 || !focus.classList.contains('block'))) {
      focus = focus.parentNode;
    }

    if (anchor === null || focus === null) {
      throw utils.exceptions['editor selection error']();
    }

    info.start.i = +anchor.getAttribute('data-i');
    info.end.i = +focus.getAttribute('data-i');

    if (Number.isNaN(info.start.i) || Number.isNaN(info.end.i)) {
      throw utils.exceptions['editor selection error']();
    }

    if (info.start.i > info.end.i) {
      info.end.i = [info.start.i, info.start.i = info.end.i][0];
      focus = [anchor, anchor = focus][0];
    }

    var position = function(node) {
      var s = node.ownerDocument.defaultView.getSelection();

      var position = Object.create(null);
      position.start = 0;
      position.end = 0;

      if (s.rangeCount > 0) {
        var range = s.getRangeAt(0);

        var cloned = range.cloneRange();
        cloned.selectNodeContents(node);
        cloned.setStart(range.startContainer, range.startOffset);
        position.start = node.textContent.length - cloned.toString().length;

        cloned = range.cloneRange();
        cloned.selectNodeContents(node);
        cloned.setEnd(range.endContainer, range.endOffset);
        position.end = cloned.toString().length;
      }

      return position;
    };

    info.start.pos = position(anchor).start;
    info.end.pos = position(focus).end;

    info.start.block = model.get(info.start.i);
    info.start.text = info.start.block.text;

    info.end.block = model.get(info.end.i);
    info.end.text = info.end.block.text;
  }

  info.is = {
    range: info.start.i !== info.end.i || info.start.pos !== info.end.pos,
    caret: info.start.i === info.end.i && info.start.pos === info.end.pos
  };

  return info;
};

exports.set = function(node, offset) {
  var s = window.getSelection();

  var tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, null);
  var range = document.createRange();

  var cur_node = null;
  var cur_offset = 0;
  var was_range_set = false;

  while ((cur_node = tw.nextNode())) {
    cur_offset += cur_node.nodeValue.length;
    if (cur_offset >= offset) {
      offset = cur_node.nodeValue.length + offset - cur_offset;
      range.setStart(cur_node, offset);
      range.setEnd(cur_node, offset);
      was_range_set = true;
      break;
    }
  }

  if (!was_range_set) {
    range.selectNodeContents(node);
    range.collapse(false);
  }

  s.removeAllRanges();
  s.addRange(range);
};