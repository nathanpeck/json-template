var engine = require('../lib/index.js');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Conditional nodes', function () {
  it('Simple match conditionals', function () {
    var characterRespondsToAnimal = {
      pronoun: '',
      animalType: '',
      animalAdjective: '',
      animalReference: "{{ animalAdjective }} {{ animalType }}",

      verbalResponse: {
        $branch: {
          $basedOn: '{{ @animalAdjective }}',
          $if: {
            'fluffy': 'Oooh cute!',
            'ferocious': 'Aaaaaahhhhh!'
          }
        }
      },

      actionResponse: {
        $branch: {
          $basedOn: '{{ @animalAdjective }}',
          $if: {
            'fluffy': 'stroked the {{ @animalType }}\'s {{ @animalAdjective }} fur.',
            'ferocious': 'ran away from the {{ @animalType }} quickly.'
          }
        }
      },
      $return: 'When {{ pronoun }} saw the {{ animalReference }} {{ pronoun }} said "{{ verbalResponse }}" and then {{ actionResponse }}'
    };

    var girlResponseToBunny = _.extend(
      _.clone(characterRespondsToAnimal),
      {
        pronoun: 'she',
        animalType: 'bunny',
        animalAdjective: 'fluffy'
      }
    );
    var result = engine.evaluate(girlResponseToBunny);
    expect(result).to.equal('When she saw the fluffy bunny she said "Oooh cute!" and ' +
      'then stroked the bunny\'s fluffy fur.');

    var boyResponseToGrizzly = _.extend(
      _.clone(characterRespondsToAnimal),
      {
        pronoun: 'he',
        animalType: 'grizzly',
        animalAdjective: 'ferocious'
      }
    );
    result = engine.evaluate(boyResponseToGrizzly);
    expect(result).to.equal('When he saw the ferocious grizzly he said "Aaaaaahhhhh!" and ' +
      'then ran away from the grizzly quickly.');
  });

  it('Conditionals matching against variables', function () {
    var characterRespondsToAnimal = {
      pronoun: '',
      animalType: '',
      animalAdjective: '',
      verbalResponse: {
        $branch: {
          $basedOn: "{{ @animalAdjective }} {{ @animalType }}",
          $if: {
            'fuzzy spider': 'Aaaaaahhhhh!',
            'fuzzy puppy': 'Awwwwwwwwww!',
            'ferocious kitten': 'Awwwwwwwwww!',
            'ferocious tiger': 'Aaaaaahhhhh!'
          }
        }
      },
      actionResponse: {
        $branch: {
          $basedOn: "{{ @animalAdjective }} {{ @animalType }}",
          $if: {
            'fuzzy spider': 'squashed it with a rolled up newspaper',
            'fuzzy puppy': 'sat down on the floor to play with it',
            'ferocious kitten': 'grabbed some string for it to chase',
            'ferocious tiger': 'cowered in fear'
          }
        }
      },
      $return: 'When {{ pronoun }} saw the {{ animalAdjective }} {{ animalType }} {{ pronoun }} said "{{ verbalResponse }}" and then {{ actionResponse }}'
    };

    var fuzzySpiderReaction = _.extend(
      _.clone(characterRespondsToAnimal),
      {
        pronoun: 'he',
        animalType: 'spider',
        animalAdjective: 'fuzzy'
      }
    );
    var result = engine.evaluate(fuzzySpiderReaction);
    expect(result).to.equal('When he saw the fuzzy spider he said "Aaaaaahhhhh!" and then squashed it with a rolled up newspaper');

    var fuzzyPuppyReaction = _.extend(
      _.clone(characterRespondsToAnimal),
      {
        pronoun: 'he',
        animalType: 'puppy',
        animalAdjective: 'fuzzy'
      }
    );
    result = engine.evaluate(fuzzyPuppyReaction);
    expect(result).to.equal('When he saw the fuzzy puppy he said "Awwwwwwwwww!" and then sat down on the floor to play with it');
  });

  it('Basic conditionals inside of a loop', function () {
    var song = {
      verses: {
        $for: {
          $index: 'verseNumber',
          $start: 99,
          $end: 0,
          $delta: -1,
          $each: {
            beerCount: "{{ @verseNumber }}",
            typeOfItem: {
              $branch: {
                $basedOn: '{{ @beerCount }}',
                $if: {
                  '1': 'bottle of beer',
                  $else: 'bottles of beer'
                }
              }
            },
            itemReference: '{{ @verseNumber }} {{ typeOfItem }}',
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
      if (count == 1) {
        expect(lines[i]).to.equal(count + ' bottle of beer on the wall, ' + count + ' bottle of beer');
      }
      else {
        expect(lines[i]).to.equal(count + ' bottles of beer on the wall, ' + count + ' bottles of beer');
      }
    }
  });

  it('Conditionals inside of a loop with fancy math', function () {
    var song = {
      verses: {
        $for: {
          $index: 'verseNumber',
          $start: 99,
          $end: 0,
          $delta: -1,
          $each: {
            numberOfItems: '{{ @verseNumber }}',
            numberOfItemsMinusOne: {
              $math: {
                $expression: "{{ @numberOfItems }} - 1"
              }
            },
            typeOfItem: {
              $branch: {
                $basedOn: '{{ @numberOfItems }}' ,
                $if: {
                  '1': 'bottle of beer',
                  $else: 'bottles of beer'
                }
              }
            },
            typeOfItemMinusOne: {
              $branch: {
                $basedOn: '{{ @numberOfItemsMinusOne }}',
                $if: {
                  '1': 'bottle of beer',
                  $else: 'bottles of beer'
                }
              }
            },
            itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
            itemReferenceMinusOne: '{{ numberOfItemsMinusOne }} {{ typeOfItemMinusOne }}',
            $return: '{{ itemReference }} on the wall, {{ itemReference }}. Take one down and pass it around, ' +
                     '{{ itemReferenceMinusOne }} on the wall.'
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
      if (count == 1) {
        expect(lines[i]).to.equal(count + ' bottle of beer on the wall, ' + count + ' bottle of beer. ' +
          'Take one down and pass it around, ' + (count - 1) + ' bottles of beer on the wall.');
      }
      else if (count == 2) {
        expect(lines[i]).to.equal(count + ' bottles of beer on the wall, ' + count + ' bottles of beer. ' +
          'Take one down and pass it around, ' + (count - 1) + ' bottle of beer on the wall.');
      }
      else {
        expect(lines[i]).to.equal(count + ' bottles of beer on the wall, ' + count + ' bottles of beer. ' +
          'Take one down and pass it around, ' + (count - 1) + ' bottles of beer on the wall.');
      }
    }
  });
});

describe('Bad branches', function () {
  it('Should handle malformed branch statement', function () {
    var characterRespondsToAnimal = {
      pronoun: 'she',
      animalType: 'slimy',
      animalAdjective: 'worm',
      animalReference: "{{ animalAdjective }} {{ animalType }}",

      verbalResponse: {
        $branch: {
          $if: {
            'fluffy': 'Oooh cute!',
            'ferocious': 'Aaaaaahhhhh!'
          }
        }
      },

      $return: 'When {{ pronoun }} saw the {{ animalReference }} {{ pronoun }} said "{{ verbalResponse }}"'
    };

    var test = function () {
      var result = engine.evaluate(characterRespondsToAnimal);
    };

    expect(test).to.throw(/required key \$basedOn/);
  });

  it('No branches match, and no $else', function () {
    var characterRespondsToAnimal = {
      pronoun: 'she',
      animalType: 'slimy',
      animalAdjective: 'worm',
      animalReference: "{{ animalAdjective }} {{ animalType }}",

      verbalResponse: {
        $branch: {
          $basedOn: 'animalAdjective',
          $if: {
            'fluffy': 'Oooh cute!',
            'ferocious': 'Aaaaaahhhhh!'
          }
        }
      },

      $return: 'When {{ pronoun }} saw the {{ animalReference }} {{ pronoun }} said "{{ verbalResponse }}"'
    };

    var test = function () {
      var result = engine.evaluate(characterRespondsToAnimal);
    };

    expect(test).to.throw(/Unable to find a matching branch/);
  });
});