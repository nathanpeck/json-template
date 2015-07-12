var engine = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Looping nodes', function () {
  it('should resolve a basic looping structure with a $return', function () {
    var song = {
      verses: {
        $for: {
          $index: 'verseNumber',
          $start: 99,
          $end: 0,
          $delta: -1,
          $each: {
            numberOfItems: '{{ @verseNumber }}',
            typeOfItem: 'bottles of beer',
            itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
            $return: '{{ itemReference }} on the wall, {{ itemReference }}'
          }
        }
      },
    };

    var result = engine.evaluate(song);

    expect(result.verses).to.be.an('array');
    expect(result.verses).to.have.length(99);
    for(var i = 0; i < 99; i++) {
      var count = 99 - i;
      expect(result.verses[i]).to.equal(count + ' bottles of beer on the wall, ' + count + ' bottles of beer');
    }
  });

  it('flatten operations should work as expected', function () {
    var song = {
      verses: {
        $for: {
          $index: 'verseNumber',
          $start: 99,
          $end: 0,
          $delta: -1,
          $each: {
            numberOfItems: '{{ @verseNumber }}',
            typeOfItem: 'bottles of beer',
            itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
            $return: '{{ itemReference }} on the wall, {{ itemReference }}'
          }
        }
      },

      $return: {
        $join: {
          $target: 'verses',
          $delimiter: '\n'
        }
      }
    };

    var result = engine.evaluate(song);
    expect(result).to.be.a('string');

    var lines = result.split('\n');
    for(var i = 0; i < 99; i++) {
      var count = 99 - i;
      expect(lines[i]).to.equal(count + ' bottles of beer on the wall, ' + count + ' bottles of beer');
    }
  });
});