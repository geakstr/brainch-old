export class Selection {
  static getInfo() {
    var sel = window.getSelection();

    if (!sel.anchorNode || !sel.focusNode) {
      return null;
    }

    var anchorNode = sel.anchorNode;
    var focusNode = sel.focusNode;

    // if (!anchorNode.classList.contains('edtr-blck')) {
    //   anchorNode = anchorNode.parentNode;
    // }

    // if (!focusNode.classList.contains('edtr-blck')) {
    //   focusNode = focusNode.parentNode;
    // }

    var startIdx = anchorNode.dataset.idx;
    var endIdx = focusNode.dataset.idx;

    if (isNaN(startIdx) || isNaN(endIdx)) {
      return null;
    }

    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
      [anchorNode, focusNode] = [focusNode, anchorNode];
    }

    var startPos = Selection.getPos(anchorNode).start;
    var endPos = Selection.getPos(focusNode).end;

    return {
      isRange: startIdx !== endIdx || startPos !== endPos,
      startPos: +startPos,
      endPos: +endPos,
      startIdx: +startIdx,
      endIdx: +endIdx
    };
  }

  static getPos(el) {
    var sel = el.ownerDocument.defaultView.getSelection();
    var start = 0;
    var end = 0;

    if (sel.rangeCount > 0) {
      var range = sel.getRangeAt(0);
      var cloneRange = range.cloneRange();

      cloneRange.selectNodeContents(el);
      cloneRange.setStart(range.startContainer, range.startOffset);
      start = el.textContent.length - cloneRange.toString().length;

      cloneRange = range.cloneRange();
      cloneRange.selectNodeContents(el);
      cloneRange.setEnd(range.endContainer, range.endOffset);
      end = cloneRange.toString().length;
    }

    return {
      start: start,
      end: end
    };
  }

  static setCaret(node, offset) {
    var sel = window.getSelection();

    var tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, null);
    var range = document.createRange();
    var curNode = null;
    var curOffset = 0;
    var wasRngSet = false;

    while ((curNode = tw.nextNode())) {
      curOffset += curNode.nodeValue.length;
      if (curOffset >= offset) {
        offset = curNode.nodeValue.length + offset - curOffset;
        range.setStart(curNode, offset);
        range.setEnd(curNode, offset);
        wasRngSet = true;
        break;
      }
    }

    if (!wasRngSet) {
      range.selectNodeContents(node);
      range.collapse(false);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  }

  static toString(model) {
    var selInfo = Selection.getInfo(model);

    var ret = selInfo.isCaret + ' ' + selInfo.startIdx + ' ';
    ret += selInfo.endIdx + ' ' + selInfo.startPos + ' ' + selInfo.endPos;
    return ret;
  }
}