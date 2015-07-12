var engine = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Recursive nodes', function () {
  it('should resolve a basic recursive structure with a $return', function () {
    var song = {
      verse: {
        numberOfItems: 99,
        typeOfItem: 'bottles of beer',
        itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
        $return: '{{ itemReference }} on the wall, {{ itemReference }}'
      },
      $return: '{{ verse }}'
    };

    var result = engine.evaluate(song);
    expect(result).to.equal('99 bottles of beer on the wall, 99 bottles of beer');
  });

  it('should resolve a recursive node that references the parent', function () {
    var song = {
      numberOfItems: 99,
      typeOfItem: 'bottles of beer',
      verse: {
        itemReference: '{{ @numberOfItems }} {{ @typeOfItem }}',
        $return: '{{ itemReference }} on the wall, {{ itemReference }}'
      },
      $return: '{{ verse }}'
    };

    var result = engine.evaluate(song);
    expect(result).to.equal('99 bottles of beer on the wall, 99 bottles of beer');
  });
});