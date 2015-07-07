export
default class Selection {
  static info() {
    const selection = window.getSelection();

    if (!selection.anchorNode || !selection.focusNode) {
      return null;
    }

    const info = Object.create(null);

    var anchorNode = selection.anchorNode;
    var focusNode = selection.focusNode;

    if (anchorNode.nodeType === 3) {
      anchorNode = anchorNode.parentNode;
    }

    if (focusNode.nodeType === 3) {
      focusNode = focusNode.parentNode;
    }

    if (!anchorNode.classList.contains('blck') || !focusNode.classList.contains('blck')) {
      return null;
    }

    info.startI = +anchorNode.dataset.i;
    info.endI = +focusNode.dataset.i;

    if (isNaN(info.startI) || isNaN(info.endI)) {
      return null;
    }

    if (info.startI > info.endI) {
      [info.startI, info.endI] = [info.endI, info.startI];
      [anchorNode, focusNode] = [focusNode, anchorNode];
    }

    info.startPos = +Selection.getSelectionRangeInNode(anchorNode).start;
    info.endPos = +Selection.getSelectionRangeInNode(focusNode).end;

    info.isRange = info.startI !== info.endI || info.startPos !== info.endPos;

    return info;
  }

  static getSelectionRangeInNode(node) {
    const selection = node.ownerDocument.defaultView.getSelection();

    const position = Object.create(null);
    position.start = 0;
    position.end = 0;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      let clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(node);
      clonedRange.setStart(range.startContainer, range.startOffset);
      position.start = node.textContent.length - clonedRange.toString().length;

      clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(node);
      clonedRange.setEnd(range.endContainer, range.endOffset);
      position.end = clonedRange.toString().length;
    }

    return position;
  }

  static setCaretInNode(node, offset) {
    const selection = window.getSelection();

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

    selection.removeAllRanges();
    selection.addRange(range);
  }
}