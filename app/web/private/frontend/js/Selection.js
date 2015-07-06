export class Selection {
  static getInfo() {
    const sel = window.getSelection();

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

    const startPos = Selection.getPos(anchorNode).start;
    const endPos = Selection.getPos(focusNode).end;

    return {
      isRange: startIdx !== endIdx || startPos !== endPos,
      startPos: +startPos,
      endPos: +endPos,
      startIdx: +startIdx,
      endIdx: +endIdx
    };
  }

  static getPos(el) {
    const sel = el.ownerDocument.defaultView.getSelection();
    const ret = {
      start: 0,
      end: 0
    };

    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);

      let clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(el);
      clonedRange.setStart(range.startContainer, range.startOffset);
      ret.start = el.textContent.length - clonedRange.toString().length;

      clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(el);
      clonedRange.setEnd(range.endContainer, range.endOffset);
      ret.end = clonedRange.toString().length;
    }

    return ret;
  }

  static setCaret(node, offset) {
    const sel = window.getSelection();

    const tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, null);
    const range = document.createRange();

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
}