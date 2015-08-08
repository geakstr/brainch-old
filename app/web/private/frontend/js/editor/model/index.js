var block = require('common/editor/model/block').factory;
var utils = require('common/utils');

module.exports = function(container) {
  var that, storage;

  storage = require('common/editor/model/storage')(container);

  that = {
    get length() {
      return storage.length;
    },

    push_block: function(b) {
      that.insert_block_by_i(storage.length, b);
    },

    insert_block_by_i: function(i, b) {
      if (!utils.is.int(i) || !utils.is.obj(b)) {
        throw new TypeError('Index must be int: i = ' + i + '. Block must be not null object: b = ' + b);
      }

      storage.blocks.splice(i, 0, b);
      storage.actualize();
    },

    remove_block_by_i: function(i) {
      var last_i, b;

      last_i = storage.length - 1;
      if (!utils.is.int(i) || i < 0 || i > last_i) {
        throw new Error('Op is not valid: i = ' + i + '; last_i (-1 if empty) = ' + last_i);
      }

      b = storage.blocks.splice(i, 1)[0];

      return {
        text: b.text,
        op: [b.start, {
          d: b.length + 1
        }]
      };
    },

    get_block_by_retain: function(retain) {
      var i, l, b, doc_l;

      doc_l = that.get_last_block().end;
      if (!utils.is.int(retain) || retain < 0 || retain > doc_l) {
        throw new Error('Op is not valid: retain = ' + retain + '; doc_l = ' + doc_l);
      }

      for (i = 0, l = storage.length; i < l; i += 1) {
        b = storage.get(i);
        if (retain >= b.start && retain <= b.end) {
          return b;
        }
      }
    },

    get_block_by_i: function(i) {
      var last_i;

      last_i = storage.length - 1;
      if (!utils.is.int(i) || i < 0 || i > last_i) {
        throw new Error('Op is not valid: i = ' + i + '; last_i (-1 if empty) = ' + last_i);
      }

      return storage.get(i);
    },

    get_last_block: function() {
      return storage.get(storage.length - 1);
    },

    get_n_chars: function(orig_retain, n) {
      var b, t, p, retain, sub_end, sub_l, last_b, doc_l;

      t = '';
      last_b = that.get_last_block();
      doc_l = last_b.end;
      retain = orig_retain;

      if (!utils.is.int(retain) || !utils.is.int(n) || retain < 0 || n < 0 || retain + n > doc_l) {
        throw new Error('Op is not valid: retain = ' + retain + '; n = ' + n + '; doc_l = ' + doc_l);
      } else if (n === 0) {
        return t;
      }

      while (n > 0) {
        b = that.get_block_by_retain(retain);
        p = retain - b.start;
        sub_end = Math.min(b.length, p + n);
        t += b.text.substring(p, sub_end);
        sub_l = sub_end - p;
        n -= sub_l;
        retain += sub_l;
        if (n > 0) {
          t += '\n';
          n -= 1;
          retain += 1;
        }
      }

      return t;
    },

    insert_text: function(orig_retain, t) {
      var b, retain, splited, i, j, moved, doc_l, splited_l, insert_text_helper;

      retain = orig_retain;
      doc_l = that.get_last_block().end;
      if (!utils.is.int(retain) || (!utils.is.str(t) && !utils.is.num(t)) || retain < 0 || retain > doc_l) {
        throw new Error('Op is not valid: retain = ' + retain + '; doc_l = ' + doc_l + '; t = ' + t);
      } else if (t.length === 0) {
        return [retain, t];
      }

      insert_text_helper = function(retain, t) {
        var b, p;

        b = that.get_block_by_retain(retain);
        p = retain - b.start;
        b.text = b.text.substring(0, p) + t + b.text.substring(p);

        storage.actualize();
      };

      splited = t.split('\n');
      splited_l = splited.length;

      if (splited_l === 1) {
        insert_text_helper(retain, splited[0]);
      } else {
        b = that.get_block_by_retain(retain);

        if (b.i === 0 && retain === 0) {
          for (i = 0; i < splited_l - 1; i += 1) {
            that.insert_block_by_i(i, block(splited[i]));
            retain += splited[i].length + 1;
          }
          insert_text_helper(retain, splited[splited_l - 1]);
        } else if (b.i === storage.length - 1 && retain === that.get_last_block().end) {
          insert_text_helper(retain, splited[0]);
          retain += splited[0].length + 1;
          for (i = 1, j = storage.length; i < splited_l; i += 1, j += 1) {
            that.insert_block_by_i(j, block(splited[i]));
            retain += splited[i].length + 1;
          }
        } else {
          b = that.get_block_by_retain(retain);
          moved = that.get_n_chars(retain, b.end - retain);
          insert_text_helper(retain, splited[0]);
          retain += splited[0].length + 1;
          that.remove_text(retain - 1, moved.length);

          for (i = 1, j = b.i + 1; i < splited_l - 1; i += 1, j += 1) {
            that.insert_block_by_i(j, block(splited[i]));
            retain += splited[i].length + 1;
          }

          that.insert_block_by_i(j, block(splited[splited_l - 1] + moved));
        }
      }

      return [orig_retain, t];
    },

    remove_text: function(orig_retain, n) {
      var i, retain, start_b, end_b, start_p, end_p, doc_l;

      retain = orig_retain;
      doc_l = that.get_last_block().end;
      if (!utils.is.int(retain) || !utils.is.int(n) || retain < 0 || n < 0 || retain + n > doc_l) {
        throw new Error('Op is not valid: retain = ' + retain + '; n = ' + n + '; doc_l = ' + doc_l);
      } else if (n === 0) {
        return [retain, {
          d: n
        }];
      }

      start_b = that.get_block_by_retain(retain);
      start_p = retain - start_b.start;

      end_b = that.get_block_by_retain(retain + n);
      end_p = retain + n - end_b.start;

      start_b.text = start_b.text.substring(0, start_p) + end_b.text.substring(end_p);
      storage.actualize();

      for (i = end_b.i; i > start_b.i; i -= 1) {
        that.remove_block_by_i(i);
      }

      return [orig_retain, {
        d: n
      }];
    }
  };

  return that;
};