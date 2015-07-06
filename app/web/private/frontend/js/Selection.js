export
default class Selection {
  static getInfo() {
    const sel = window.getSelection();

    if (!sel.anchorNode || !sel.focusNode) {
      return null;
    }

    const info = Object.create(null);

    var anchorNode = sel.anchorNode.parentNode;
    var focusNode = sel.focusNode.parentNode;

    info.startI = +anchorNode.dataset.i;
    info.endI = +focusNode.dataset.i;

    if (isNaN(info.startI) || isNaN(info.endI)) {
      return null;
    }

    if (info.startI > info.endI) {
      [info.startI, info.endI] = [info.endI, info.startI];
      [anchorNode, focusNode] = [focusNode, anchorNode];
    }

    info.startPos = +Selection.getPos(anchorNode).start;
    info.endPos = +Selection.getPos(focusNode).end;

    info.isRange = info.startI !== info.endI || info.startPos !== info.endPos;

    return info;
  }

  static getPos(el) {
    const sel = el.ownerDocument.defaultView.getSelection();

    const pos = Object.create(null);
    pos.start = 0;
    pos.end = 0;

    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);

      let clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(el);
      clonedRange.setStart(range.startContainer, range.startOffset);
      pos.start = el.textContent.length - clonedRange.toString().length;

      clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(el);
      clonedRange.setEnd(range.endContainer, range.endOffset);
      pos.end = clonedRange.toString().length;
    }

    return pos;
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