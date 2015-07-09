module.exports = (function() {
  function Selection() {}

  Selection.info = function selectionInfo() {
    var selection = window.getSelection();

    if (!selection.anchorNode || !selection.focusNode) {
      return null;
    }

    var info = Object.create(null);
    info.allBlocksSelected = false;

    var anchorNode = selection.anchorNode;
    var focusNode = selection.focusNode;

    if (anchorNode.id === 'edtr' || focusNode.id === 'edtr') {
      info.allBlocksSelected = true;
      return info;
    }

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
      info.endI = [info.startI, info.startI = info.endI][0];
      focusNode = [anchorNode, anchorNode = focusNode][0];
    }

    info.startPos = +Selection.getSelectionRangeInNode(anchorNode).start;
    info.endPos = +Selection.getSelectionRangeInNode(focusNode).end;

    info.isRange = info.startI !== info.endI || info.startPos !== info.endPos;

    return info;
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