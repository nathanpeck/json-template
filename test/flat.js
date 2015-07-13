var engine = require('../lib/index.js');
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

    var result = engine.evaluate(verse);
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

    var result = engine.evaluate(verse);
    expect(result).to.equal('99 bottles of beer on the wall, 99 bottles of beer');
  });
});

describe('Malformed flat nodes', function () {
  it('should catch node with reference that is impossible to evaluate', function () {
    var badReference = {
      foo: 'foo',
      bar: 'bar',
      foobar: '{{ foo }}{{ bar }}',
      foobaz: '{{ foo }}{{ baz }}'
    };

    var test = function () {
      var result = engine.evaluate(badReference);
    };

    expect(test).to.throw(/resolve variable reference/);
  });

  it('should catch circular references', function () {
    var badReference = {
      foo: '{{ bar }}',
      bar: '{{ foo }}',
      foobar: '{{ foo }}{{ bar }}',
      foobaz: 'trololololol'
    };

    var test = function () {
      var result = engine.evaluate(badReference);
    };

    expect(test).to.throw(/circular variable references/);
  });

  it('should catch bad returns', function () {
    var badReference = {
      foo: 'bar',
      $return: '{{ bar }}'
    };

    var test = function () {
      var result = engine.evaluate(badReference);
    };

    expect(test).to.throw(/resolve variable reference/);
  });
});