var Types = exports.enum = {
  TASK: 'task',
  EMPTY: 'empty',
  NOTE: 'note'
};

exports.detect = function(x) {
  if (x.trim()[0] === '-') {
    return Types.TASK;
  } else if (x.length === 0) {
    return Types.EMPTY;
  }

  return Types.NOTE;
};