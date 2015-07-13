var engine = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Nested nodes', function () {
  it('should resolve a basic nested structure with a $return', function () {
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

  it('should resolve a nested node that references the parent', function () {
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

describe('Malformed nested nodes', function () {
  it('should catch deep node with reference that is impossible to evaluate', function () {
    var song = {
      verse: {
        itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
        $return: '{{ itemReference }} on the wall, {{ itemReference }}'
      },
      $return: '{{ verse }}'
    };

    var test = function () {
      var result = engine.evaluate(song);
    };

    expect(test).to.throw(/resolve variable reference/);
  });

  it('should catch reference to nonexistant parent key', function () {
    var song = {
      verse: {
        itemReference: '{{ @numberOfItems }} {{ @typeOfItem }}',
        $return: '{{ itemReference }} on the wall, {{ itemReference }}'
      },
      $return: '{{ verse }}'
    };

    var test = function () {
      var result = engine.evaluate(song);
    };

    expect(test).to.throw(/could not be located in the parent node/);
  });
});