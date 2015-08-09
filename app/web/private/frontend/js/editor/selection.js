'use strict';

var app = require('frontend/app');

exports.get = function() {
  var info, s, anchor, focus, position;
  var anchor_i, focus_i, anchor_p, focus_p, anchor_b, focus_b;

  try {
    s = window.getSelection();

    if (!s.anchorNode || !s.focusNode) {
      throw new Error('Editor selection error');
    }

    anchor = s.anchorNode;
    focus = s.focusNode;

    info = exports.build();

    if (anchor.id !== 'editor' && focus.id !== 'editor') {
      while (anchor.parentNode !== null && (anchor.nodeType !== 1 || !anchor.classList.contains('block'))) {
        anchor = anchor.parentNode;
      }

      while (focus.parentNode !== null && (focus.nodeType !== 1 || !focus.classList.contains('block'))) {
        focus = focus.parentNode;
      }

      if (anchor === null || focus === null) {
        throw new Error('Editor selection error');
      }

      anchor_i = +anchor.getAttribute('data-i');
      focus_i = +focus.getAttribute('data-i');

      if (Number.isNaN(anchor_i) || Number.isNaN(focus_i)) {
        throw new Error('Editor selection error');
      }

      if (anchor_i > focus_i) {
        focus_i = [anchor_i, anchor_i = focus_i][0];
        focus = [anchor, anchor = focus][0];
      }

      position = function(node) {
        var s, p, range, cloned;

        s = node.ownerDocument.defaultView.getSelection();

        p = Object.create(null);
        p.start = 0;
        p.end = 0;

        if (s.rangeCount > 0) {
          range = s.getRangeAt(0);

          cloned = range.cloneRange();
          cloned.selectNodeContents(node);
          cloned.setStart(range.startContainer, range.startOffset);
          p.start = node.textContent.length - cloned.toString().length;

          cloned = range.cloneRange();
          cloned.selectNodeContents(node);
          cloned.setEnd(range.endContainer, range.endOffset);
          p.end = cloned.toString().length;
        }

        return p;
      };

      anchor_p = position(anchor).start;
      focus_p = position(focus).end;

      anchor_b = app.editor.model.get_block_by_i(anchor_i);
      focus_b = app.editor.model.get_block_by_i(focus_i);

      info.n = focus_p - anchor_p;
      if (anchor_i !== focus_i) {
        info.n += focus_b.start - anchor_b.start;
      }
      info.start = anchor_b.start + anchor_p;
      info.end = info.start + info.n;
      info.anchor_p = anchor_p;
      info.focus_p = focus_p;
      info.anchor_i = anchor_i;
      info.focus_i = focus_i;
    }

    return info;
  } catch (e) {
    if (e.message === 'Editor selection error') {
      return undefined;
    } else {
      throw e;
    }
  }
};

exports.set = function(node, offset) {
  var s, tw, range, cur_node, cur_offset, was_range_set;

  s = window.getSelection();

  tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, null);
  range = document.createRange();

  cur_node = null;
  cur_offset = 0;
  was_range_set = false;

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

exports.build = function() {
  var info;

  info = Object.create(null);
  info.n = 0;
  info.start = 0;
  info.end = app.editor.model.get_last_block().end;
  info.anchor_p = 0;
  info.focus_p = app.editor.model.get_last_block().length;
  info.anchor_i = 0;
  info.focus_i = app.editor.model.length - 1;

  return info;
};

exports.clone = function(s) {
  var info;

  info = Object.create(null);
  info.n = s.n;
  info.start = s.start;
  info.end = s.end;
  info.anchor_p = s.anchor_p;
  info.focus_p = s.focus_p;
  info.anchor_i = s.anchor_i;
  info.focus_i = s.focus_i;

  return info;
};