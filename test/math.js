var engine = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Math nodes', function () {
  it('should resolve a basic node', function () {
    var verse = {
      numberOfItems: 99,
      numberOfItemsMinusOne: {
        $math: {
          $expression: "{{ @numberOfItems }} - 1"
        }
      },
      typeOfItem: 'bottles of beer',
      itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
      itemReferenceMinusOne: '{{ numberOfItemsMinusOne }} {{ typeOfItem }}',
      verse: '{{ itemReference }} on the wall, {{ itemReference }}. Take one down and pass it around, ' +
            '{{ itemReferenceMinusOne }} on the wall.'
    };

    var result = engine.evaluate(verse);
    expect(result.itemReference).to.equal('99 bottles of beer');
    expect(result.verse).to.equal('99 bottles of beer on the wall, 99 bottles of beer. Take one down and pass it around, ' +
      '98 bottles of beer on the wall.');
  });

  it('should handle nasty type errors', function () {
    var badData = {
      variableOne: 'bullshit',
      variableTwo: 42,
      calculate: {
        $math: {
          $expression: "{{ @variableOne }} - {{ @variableTwo }}"
        }
      },
      $return: "{{ calculate }}"
    };

    var evaluation = function () {
      engine.evaluate(badData);
    };
    expect(evaluation).to.throw(Error);
  });
});