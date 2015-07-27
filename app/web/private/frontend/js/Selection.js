module.exports = (function() {
  function Selection() {}

  Selection.info = function selectionInfo(endI, endPos) {
    var selection = window.getSelection();

    if (!selection.anchorNode || !selection.focusNode) {
      return null;
    }

    var anchorNode = selection.anchorNode;
    var focusNode = selection.focusNode;

    var startI = 0;
    var startPos = 0;
    if (anchorNode.id === 'edtr' || focusNode.id === 'edtr') {
      return Selection.buildInfo(startI, endI, startPos, endPos);
    }

    while (anchorNode.parentNode !== null &&
      (anchorNode.nodeType !== 1 || !anchorNode.classList.contains('blck'))) {
      anchorNode = anchorNode.parentNode;
    }

    while (focusNode.parentNode !== null &&
      (focusNode.nodeType !== 1 || !focusNode.classList.contains('blck'))) {
      focusNode = focusNode.parentNode;
    }

    if (anchorNode === null || focusNode === null) {
      return null;
    }

    startI = +anchorNode.dataset.i;
    endI = +focusNode.dataset.i;

    if (isNaN(startI) || isNaN(endI)) {
      return null;
    }

    if (startI > endI) {
      endI = [startI, startI = endI][0];
      focusNode = [anchorNode, anchorNode = focusNode][0];
    }

    startPos = +Selection.getSelectionRangeInNode(anchorNode).start;
    endPos = +Selection.getSelectionRangeInNode(focusNode).end;

    return Selection.buildInfo(startI, endI, startPos, endPos);
  };

  Selection.buildInfo = function selectionBuildInfo(startI, endI, startPos, endPos) {
    var info = Object.create(null);
    info.startI = startI;
    info.endI = endI;
    info.startPos = startPos;
    info.endPos = endPos;
    info.isRange = startI !== endI || startPos !== endPos;
    return info;
  };

  Selection.getSelectionRangeInNode = function selectionGetSelectionRangeInNode(node) {
    var selection = node.ownerDocument.defaultView.getSelection();

    var position = Object.create(null);
    position.start = 0;
    position.end = 0;

    if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);

      var clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(node);
      clonedRange.setStart(range.startContainer, range.startOffset);
      position.start = node.textContent.length - clonedRange.toString().length;

      clonedRange = range.cloneRange();
      clonedRange.selectNodeContents(node);
      clonedRange.setEnd(range.endContainer, range.endOffset);
      position.end = clonedRange.toString().length;
    }

    return position;
  };

  Selection.setCaretInNode = function selectionSetCaretInNode(node, offset) {
    var selection = window.getSelection();

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

    selection.removeAllRanges();
    selection.addRange(range);
  };

  return Selection;
})();