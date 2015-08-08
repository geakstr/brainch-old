'use strict';

var utils = require('common/utils');

exports.get = function(model) {
  var info, s, i, anchor, focus, position;
  var start_i, end_i, start_pos, end_pos, start_block;

  try {
    s = window.getSelection();

    if (!s.anchorNode || !s.focusNode) {
      throw utils.exceptions['editor selection error']();
    }

    anchor = s.anchorNode;
    focus = s.focusNode;

    info = Object.create(null);
    info.retain = 0;
    info.n = model.get_last_block().end;

    if (anchor.id !== 'editor' && focus.id !== 'editor') {
      while (anchor.parentNode !== null && (anchor.nodeType !== 1 || !anchor.classList.contains('block'))) {
        anchor = anchor.parentNode;
      }

      while (focus.parentNode !== null && (focus.nodeType !== 1 || !focus.classList.contains('block'))) {
        focus = focus.parentNode;
      }

      if (anchor === null || focus === null) {
        throw utils.exceptions['editor selection error']();
      }

      start_i = +anchor.getAttribute('data-i');
      end_i = +focus.getAttribute('data-i');

      if (Number.isNaN(start_i) || Number.isNaN(end_i)) {
        throw utils.exceptions['editor selection error']();
      }

      if (start_i > end_i) {
        end_i = [start_i, start_i = end_i][0];
        focus = [anchor, anchor = focus][0];
      }

      position = function(node) {
        var s, position, range, cloned;

        s = node.ownerDocument.defaultView.getSelection();

        position = Object.create(null);
        position.start = 0;
        position.end = 0;

        if (s.rangeCount > 0) {
          range = s.getRangeAt(0);

          cloned = range.cloneRange();
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

      start_pos = position(anchor).start;
      end_pos = position(focus).end;

      start_block = model.get_block_by_i(start_i);

      info.retain = start_block.start + start_pos;
      if (start_i === end_i) {
        info.n = end_pos - start_pos;
      } else {
        info.n = start_block.length - start_pos;
        for (i = start_i + 1; i < end_i; i += 1) {
          info.n += model.get_block_by_i(i).length;
        }
        info.n += end_pos;
      }
    }

    return info;
  } catch (e) {
    if (e.name === 'EditorError') {
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