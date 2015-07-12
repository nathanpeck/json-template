var run = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Flat nodes', function () {
  it('should resolve a basic node', function () {
    var verse = {
      numberOfItems: 99,
      typeOfItem: 'bottles of beer',
      itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
      verse: '{{ itemReference }} on the wall, {{ itemReference }}'
    };

    var result = run(verse);
    expect(result.itemReference).to.equal('99 bottles of beer');
    expect(result.verse).to.equal('99 bottles of beer on the wall, 99 bottles of beer');
  });

  it('should resolve a basic node with a $return', function () {
    var verse = {
      numberOfItems: 99,
      typeOfItem: 'bottles of beer',
      itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
      $return: '{{ itemReference }} on the wall, {{ itemReference }}'
    };

    var result = run(verse);
    expect(result).to.equal('99 bottles of beer on the wall, 99 bottles of beer');
  });
});