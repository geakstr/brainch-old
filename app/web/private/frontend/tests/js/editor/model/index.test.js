/*global describe, expect, it, beforeEach, afterEach */

var app = require('frontend/app');
var block = require('frontend/editor/model/block');
var chai = require('chai');
var expect = chai.expect;

describe('editor/model', function() {
  var model, init, blocks_texts;

  init = function() {
    blocks_texts = [
      'abcde',
      'fgh',
      'ijklmn',
      'opqr'
    ];

    app.editor.ot = require('frontend/editor/ot')();
    app.editor.container = document.createElement('div');
    app.editor.storage = require('frontend/editor/model/storage')();
    model = require('frontend/editor/model')(blocks_texts.join('\n'));
  };

  beforeEach(function() {
    init();
  });

  afterEach(function() {
    model = null;
  });

  describe('push_block/get_last_block', function() {
    it('text in pushed block shoud equals', function() {
      model.push_block(block('azaza'));
      expect(model.get_last_block().text).to.eql('azaza');
      model.push_block(block('ololo'));
      expect(model.get_last_block().text).to.eql('ololo');
    });
  });
  describe('insert_block_by_i', function() {
    it('text in inserted block should equals', function() {
      model.insert_block_by_i(0, block('azaza'));
      expect(model.get_block_by_i(0).text).to.eql('azaza');
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(2).text).to.eql(blocks_texts[1]);

      model.insert_block_by_i(1, block('azaza'));
      expect(model.get_block_by_i(0).text).to.eql('azaza');
      expect(model.get_block_by_i(1).text).to.eql('azaza');
      expect(model.get_block_by_i(2).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(3).text).to.eql(blocks_texts[1]);
    });
    it('should throw exception', function() {
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1.1, {})).to.throw(/Index must be int/);
      init();
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, '1', {})).to.throw(/Index must be int/);

      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1, null)).to.throw(/Block must be not null object/);
      init();
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1, false)).to.throw(/Block must be not null object/);
      init();
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1, 5)).to.throw(/Block must be not null object/);
      init();
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1, 'azaza')).to.throw(/Block must be not null object/);
    });
    it('should not throw exception', function() {
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1, {})).to.not.throw(/Index must be int/);
      init();
      expect(model.insert_block_by_i.bind(model.insert_block_by_i, 1, {})).to.not.throw(/Block must be not null objec/);
    });
  });
  describe('remove_block_by_i', function() {
    it('text in next block should equals', function() {
      model.remove_block_by_i(0);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[1]);
      model.remove_block_by_i(0);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[2]);
      model.remove_block_by_i(0);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[3]);
    });
    it('should throw exception', function() {
      expect(model.remove_block_by_i.bind(model.remove_block_by_i, 1.1, {})).to.throw(/Op is not valid/);
      init();
      expect(model.remove_block_by_i.bind(model.remove_block_by_i, '1', {})).to.throw(/Op is not valid/);
      init();

      expect(model.remove_block_by_i.bind(model.remove_block_by_i, -2)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_block_by_i.bind(model.remove_block_by_i, 4)).to.throw(/Op is not valid/);
    });
  });
  describe('length', function() {
    it('blocks length shoud equals', function() {
      model.push_block(block(''));
      expect(model.length).to.eql(5);
      model.push_block(block(''));
      model.push_block(block(''));
      expect(model.length).to.eql(7);
    });
  });
  describe('get_block_by_retain', function() {
    it('block index should equals', function() {
      var i;
      for (i = 0; i <= 5; i += 1) {
        expect(model.get_block_by_retain(i).i).to.eql(0);
      }
      for (i = 6; i <= 9; i += 1) {
        expect(model.get_block_by_retain(i).i).to.eql(1);
      }
      for (i = 10; i <= 16; i += 1) {
        expect(model.get_block_by_retain(i).i).to.eql(2);
      }
      for (i = 17; i <= 21; i += 1) {
        expect(model.get_block_by_retain(i).i).to.eql(3);
      }
    });
    it('should throw exception', function() {
      expect(model.get_block_by_retain.bind(model.get_block_by_retain, -2)).to.throw(/Op is not valid/);
      init();
      expect(model.get_block_by_retain.bind(model.get_block_by_retain, 22)).to.throw(/Op is not valid/);

      expect(model.get_block_by_retain.bind(model.get_block_by_retain, 1.1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_block_by_retain.bind(model.get_block_by_retain, '1')).to.throw(/Op is not valid/);
    });
    it('should not throw exception', function() {
      expect(model.get_block_by_retain.bind(model.get_block_by_retain, 0)).to.not.throw(/Op is not valid/);
      init();
      expect(model.get_block_by_retain.bind(model.get_block_by_retain, 21)).to.not.throw(/Op is not valid/);
    });
  });
  describe('get_block_by_i', function() {
    it('block text should equals', function() {
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[1]);
      expect(model.get_block_by_i(2).text).to.eql(blocks_texts[2]);
      expect(model.get_block_by_i(3).text).to.eql(blocks_texts[3]);
    });
    it('should throw exception', function() {
      expect(model.get_block_by_i.bind(model.get_block_by_i, -1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_block_by_i.bind(model.get_block_by_i, 4)).to.throw(/Op is not valid/);

      expect(model.get_block_by_i.bind(model.get_block_by_i, 1.1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_block_by_i.bind(model.get_block_by_i, '1')).to.throw(/Op is not valid/);
    });
    it('should not throw exception', function() {
      expect(model.get_block_by_i.bind(model.get_block_by_i, 3)).to.not.throw(/Op is not valid/);
    });
  });
  describe('get_n_chars', function() {
    it('substr text should equals', function() {
      expect(model.get_n_chars(5, 0)).to.eql('');
      expect(model.get_n_chars(0, 5)).to.eql(blocks_texts[0]);
      expect(model.get_n_chars(0, 6)).to.eql(blocks_texts[0] + '\n');
      expect(model.get_n_chars(0, 7)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1][0]);
      expect(model.get_n_chars(0, 9)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1]);
      expect(model.get_n_chars(0, 10)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n');
      expect(model.get_n_chars(0, 11)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n' + blocks_texts[2][0]);
      expect(model.get_n_chars(0, 12)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n' + blocks_texts[2][0] + blocks_texts[2][1]);
      expect(model.get_n_chars(0, 16)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n' + blocks_texts[2]);
      expect(model.get_n_chars(0, 17)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n' + blocks_texts[2] + '\n');
      expect(model.get_n_chars(0, 19)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n' + blocks_texts[2] + '\n' + blocks_texts[3][0] + blocks_texts[3][1]);
      expect(model.get_n_chars(0, 21)).to.eql(blocks_texts[0] + '\n' + blocks_texts[1] + '\n' + blocks_texts[2] + '\n' + blocks_texts[3]);
    });
    it('should not throw exception', function() {
      expect(model.get_n_chars.bind(model.get_n_chars, 21, 0)).to.not.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 20, 1)).to.not.throw(/Op is not valid/);
    });
    it('should throw exception', function() {
      expect(model.get_n_chars.bind(model.get_n_chars, 21, 1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 20, 2)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 0, 22)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 0, 500)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, -5, 1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, -5, -5)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 1, -5)).to.throw(/Op is not valid/);

      expect(model.get_n_chars.bind(model.get_n_chars, 1, '1')).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, '1', 1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 1.1, 1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 1, 1.1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 1.1, '1')).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, '1', 1.1)).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, '1', '1')).to.throw(/Op is not valid/);
      init();
      expect(model.get_n_chars.bind(model.get_n_chars, 1.1, 1.1)).to.throw(/Op is not valid/);
    });
  });
  describe('remove_text', function() {
    it('block text should equals (vol. 1)', function() {
      model.remove_text(0, 1);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0].substring(1));
      model.remove_text(0, 1);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0].substring(2));
      model.remove_text(0, 3);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0].substring(5));

      init();

      model.remove_text(0, 5);
      expect(model.get_block_by_i(0).text).to.eql('');

      init();

      model.remove_text(1, 4);
      expect(model.get_block_by_i(0).text).to.eql('a');

      init();

      model.remove_text(1, 3);
      expect(model.get_block_by_i(0).text).to.eql('ae');
    });
    it('block text should equals (vol. 2)', function() {
      model.remove_text(0, 6);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[1]);

      init();

      model.remove_text(0, 8);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[1].substring(2));

      init();

      model.remove_text(1, 7);
      expect(model.get_block_by_i(0).text).to.eql('a' + blocks_texts[1].substring(2));

      init();

      model.remove_text(1, 8);
      expect(model.get_block_by_i(0).text).to.eql('a');

      init();

      model.remove_text(0, 9);
      expect(model.get_block_by_i(0).text).to.eql('');
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[2]);
    });
    it('block text should equals (vol. 3)', function() {
      model.remove_text(1, 9);
      expect(model.get_block_by_i(0).text).to.eql('a' + blocks_texts[2]);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[3]);

      init();

      model.remove_text(1, 10);
      expect(model.get_block_by_i(0).text).to.eql('a' + blocks_texts[2].substring(1));
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[3]);

      init();

      model.remove_text(5, 1);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0] + blocks_texts[1]);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[2]);

      init();

      model.remove_text(5, 4);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[2]);

      init();

      model.remove_text(5, 5);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0] + blocks_texts[2]);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[3]);

      init();

      model.remove_text(6, 3);
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(1).text).to.eql('');

      init();

      model.remove_text(7, 3);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[1].substring(0, 1) + blocks_texts[2]);
      expect(model.get_block_by_i(2).text).to.eql(blocks_texts[3]);

      init();

      model.remove_text(7, 10);
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[1].substring(0, 1) + blocks_texts[3]);

      init();
      model.remove_text(0, 21);
      expect(model.get_block_by_i(0).text).to.eql('');
    });
    it('should not throw exception', function() {
      expect(model.remove_text.bind(model.remove_text, 21, 0)).to.not.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 20, 1)).to.not.throw(/Op is not valid/);
    });
    it('should throw exception', function() {
      expect(model.remove_text.bind(model.remove_text, 21, 1)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 20, 2)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 0, 22)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 0, 500)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, -5, 1)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, -5, -5)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 1, -5)).to.throw(/Op is not valid/);
      init();

      expect(model.remove_text.bind(model.remove_text, 1, '1')).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, '1', 1)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 1.1, 1)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 1, 1.1)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 1.1, '1')).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, '1', 1.1)).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, '1', '1')).to.throw(/Op is not valid/);
      init();
      expect(model.remove_text.bind(model.remove_text, 1.1, 1.1)).to.throw(/Op is not valid/);
    });
  });
  describe('insert_text', function() {
    it('block text should equals (vol. 0)', function() {
      model.insert_text(0, '\n');
      expect(model.get_block_by_i(0).text).to.eql('');
      expect(model.get_block_by_i(1).text).to.eql(blocks_texts[0]);

      model.insert_text(2, '\n');
      expect(model.get_block_by_i(0).text).to.eql('');
      expect(model.get_block_by_i(1).text).to.eql('a');
      expect(model.get_block_by_i(2).text).to.eql('bcde');

      init();

      model.insert_text(2, '\n');
      expect(model.get_block_by_i(0).text).to.eql('ab');
      expect(model.get_block_by_i(1).text).to.eql('cde');

      init();

      model.insert_text(5, '\n');
      expect(model.get_block_by_i(0).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(1).text).to.eql('');
      expect(model.get_block_by_i(2).text).to.eql(blocks_texts[1]);
    });
    it('block text should equals (vol. 1)', function() {
      model.insert_text(0, 's');
      expect(model.get_block_by_i(0).text).to.eql('s' + blocks_texts[0]);

      model.insert_text(0, 't');
      expect(model.get_block_by_i(0).text).to.eql('ts' + blocks_texts[0]);

      model.insert_text(1, 'u');
      expect(model.get_block_by_i(0).text).to.eql('tus' + blocks_texts[0]);

      model.insert_text(8, 'v');
      expect(model.get_block_by_i(0).text).to.eql('tus' + blocks_texts[0] + 'v');

      model.insert_text(10, 'wx');
      expect(model.get_block_by_i(0).text).to.eql('tus' + blocks_texts[0] + 'v');
      expect(model.get_block_by_i(1).text).to.eql('wx' + blocks_texts[1]);
      model.insert_text(15, 'y');
      expect(model.get_block_by_i(1).text).to.eql('wx' + blocks_texts[1] + 'y');
    });
    it('block text should equals (vol. 2)', function() {
      model.insert_text(0, 'hello\nworld ');
      expect(model.get_block_by_i(0).text).to.eql('hello');
      expect(model.get_block_by_i(1).text).to.eql('world ' + blocks_texts[0]);

      init();

      model.insert_text(0, 'hello\nworld\n');
      expect(model.get_block_by_i(0).text).to.eql('hello');
      expect(model.get_block_by_i(1).text).to.eql('world');
      expect(model.get_block_by_i(2).text).to.eql(blocks_texts[0]);

      init();

      model.insert_text(0, 'hello\n\nworld\n\n');
      expect(model.get_block_by_i(0).text).to.eql('hello');
      expect(model.get_block_by_i(1).text).to.eql('');
      expect(model.get_block_by_i(2).text).to.eql('world');
      expect(model.get_block_by_i(3).text).to.eql('');
      expect(model.get_block_by_i(4).text).to.eql(blocks_texts[0]);
      expect(model.get_block_by_i(5).text).to.eql(blocks_texts[1]);
    });
    it('block text should equals (vol. 3)', function() {
      model.insert_text(21, ' hello\nworld');
      expect(model.get_block_by_i(3).text).to.eql(blocks_texts[3] + ' hello');
      expect(model.get_block_by_i(4).text).to.eql('world');

      init();

      model.insert_text(21, ' hello\nworld\n');
      expect(model.get_block_by_i(3).text).to.eql(blocks_texts[3] + ' hello');
      expect(model.get_block_by_i(4).text).to.eql('world');
      expect(model.get_block_by_i(5).text).to.eql('');

      init();

      model.insert_text(21, ' hello\n\nworld\n\n');
      expect(model.get_block_by_i(3).text).to.eql(blocks_texts[3] + ' hello');
      expect(model.get_block_by_i(4).text).to.eql('');
      expect(model.get_block_by_i(5).text).to.eql('world');
      expect(model.get_block_by_i(6).text).to.eql('');
      expect(model.get_block_by_i(7).text).to.eql('');
    });
    it('block text should equals (vol. 4)', function() {
      model.insert_text(6, 'hello\nworld');
      expect(model.get_block_by_i(1).text).to.eql('hello');
      expect(model.get_block_by_i(2).text).to.eql('worldfgh');

      init();

      model.insert_text(6, 'hello\nworld\n');
      expect(model.get_block_by_i(1).text).to.eql('hello');
      expect(model.get_block_by_i(2).text).to.eql('world');
      expect(model.get_block_by_i(3).text).to.eql('fgh');

      init();

      model.insert_text(6, '\nhello\nworld\nhow\nare you\n');
      expect(model.get_block_by_i(1).text).to.eql('');
      expect(model.get_block_by_i(2).text).to.eql('hello');
      expect(model.get_block_by_i(3).text).to.eql('world');
      expect(model.get_block_by_i(4).text).to.eql('how');
      expect(model.get_block_by_i(5).text).to.eql('are you');
      expect(model.get_block_by_i(6).text).to.eql('fgh');

      init();

      model.insert_text(6, '\n\nhello\nworld\nhow\n\nare you\n\n');
      expect(model.get_block_by_i(1).text).to.eql('');
      expect(model.get_block_by_i(2).text).to.eql('');
      expect(model.get_block_by_i(3).text).to.eql('hello');
      expect(model.get_block_by_i(4).text).to.eql('world');
      expect(model.get_block_by_i(5).text).to.eql('how');
      expect(model.get_block_by_i(6).text).to.eql('');
      expect(model.get_block_by_i(7).text).to.eql('are you');
      expect(model.get_block_by_i(8).text).to.eql('');
      expect(model.get_block_by_i(9).text).to.eql('fgh');
    });
    it('block text should equals (vol. 5)', function() {
      model.insert_text(7, ' hello\nworld');
      expect(model.get_block_by_i(1).text).to.eql('f hello');
      expect(model.get_block_by_i(2).text).to.eql('worldgh');

      init();

      model.insert_text(7, ' hello\nworld\n');
      expect(model.get_block_by_i(1).text).to.eql('f hello');
      expect(model.get_block_by_i(2).text).to.eql('world');
      expect(model.get_block_by_i(3).text).to.eql('gh');

      init();

      model.insert_text(7, '\nhello\nworld\nhow\nare you\n');
      expect(model.get_block_by_i(1).text).to.eql('f');
      expect(model.get_block_by_i(2).text).to.eql('hello');
      expect(model.get_block_by_i(3).text).to.eql('world');
      expect(model.get_block_by_i(4).text).to.eql('how');
      expect(model.get_block_by_i(5).text).to.eql('are you');
      expect(model.get_block_by_i(6).text).to.eql('gh');

      init();

      model.insert_text(7, '\n\nhello\nworld\nhow\n\nare you\n\n');
      expect(model.get_block_by_i(1).text).to.eql('f');
      expect(model.get_block_by_i(2).text).to.eql('');
      expect(model.get_block_by_i(3).text).to.eql('hello');
      expect(model.get_block_by_i(4).text).to.eql('world');
      expect(model.get_block_by_i(5).text).to.eql('how');
      expect(model.get_block_by_i(6).text).to.eql('');
      expect(model.get_block_by_i(7).text).to.eql('are you');
      expect(model.get_block_by_i(8).text).to.eql('');
      expect(model.get_block_by_i(9).text).to.eql('gh');
    });
    it('block text should equals (vol. 6)', function() {
      model.insert_text(9, ' hello\nworld');
      expect(model.get_block_by_i(1).text).to.eql('fgh hello');
      expect(model.get_block_by_i(2).text).to.eql('world');

      init();

      model.insert_text(9, ' hello\nworld\n');
      expect(model.get_block_by_i(1).text).to.eql('fgh hello');
      expect(model.get_block_by_i(2).text).to.eql('world');
      expect(model.get_block_by_i(3).text).to.eql('');

      init();

      model.insert_text(9, '\nhello\nworld\nhow\nare you\n');
      expect(model.get_block_by_i(1).text).to.eql('fgh');
      expect(model.get_block_by_i(2).text).to.eql('hello');
      expect(model.get_block_by_i(3).text).to.eql('world');
      expect(model.get_block_by_i(4).text).to.eql('how');
      expect(model.get_block_by_i(5).text).to.eql('are you');
      expect(model.get_block_by_i(6).text).to.eql('');

      init();

      model.insert_text(9, '\n\nhello\nworld\nhow\n\nare you\n\n');
      expect(model.get_block_by_i(1).text).to.eql('fgh');
      expect(model.get_block_by_i(2).text).to.eql('');
      expect(model.get_block_by_i(3).text).to.eql('hello');
      expect(model.get_block_by_i(4).text).to.eql('world');
      expect(model.get_block_by_i(5).text).to.eql('how');
      expect(model.get_block_by_i(6).text).to.eql('');
      expect(model.get_block_by_i(7).text).to.eql('are you');
      expect(model.get_block_by_i(8).text).to.eql('');
      expect(model.get_block_by_i(9).text).to.eql('');
    });
    it('should throw exception', function() {
      expect(model.insert_text.bind(model.insert_text, -1, 'Text')).to.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 22, 'Text')).to.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 0, null)).to.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 0, {})).to.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 0, undefined)).to.throw(/Op is not valid/);
    });
    it('should not throw exception', function() {
      expect(model.insert_text.bind(model.insert_text, 0, 'Text')).to.not.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 0, 3)).to.not.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 0, 3.3)).to.not.throw(/Op is not valid/);
      init();
      expect(model.insert_text.bind(model.insert_text, 0, -5)).to.not.throw(/Op is not valid/);
    });
  });
});