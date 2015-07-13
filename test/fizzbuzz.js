var engine = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Fizzbuzz', function () {
  it('should be able to do fizzbuzz', function () {
    var test = {
      fizzbuzz: {
        $for: {
          $index: 'iterationNumber',
          $start: 1,
          $end: 31,
          $delta: 1,
          $each: {
            index: "{{ @iterationNumber }}",
            mod3: {
              $math: {
                $expression: "{{ @index }} % 3 == 0"
              }
            },
            mod5: {
              $math: {
                $expression: "{{ @index }} % 5 == 0"
              }
            },
            $return: {
              $branch: {
                $basedOn: '{{ @mod3 }}:{{ @mod5 }}',
                $if: {
                  "true:true": "Fizzbuzz",
                  "true:false": "Fizz",
                  "false:true": "Buzz",
                  "false:false": "{{ @iterationNumber }}"
                }
              }
            }
          }
        }
      },

      $return: {
        $join: {
          $target: 'fizzbuzz',
          $delimiter: ', '
        }
      }
    };

    var result = engine.evaluate(test);
    expect(result).to.equal('1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, Fizzbuzz, 16, 17, Fizz, 19, Buzz, Fizz, 22, 23, Fizz, Buzz, 26, Fizz, 28, 29, Fizzbuzz');
  });
});