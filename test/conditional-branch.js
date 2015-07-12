var run = require('../lib/index.js');
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
          $basedOn: 'animalAdjective',
          $if: {
            'fluffy': 'Oooh cute!',
            'ferocious': 'Aaaaaahhhhh!'
          }
        }
      },
      actionResponse: {
        $branch: {
          $basedOn: 'animalAdjective',
          $if: {
            'fluffy': 'stroked the {{ animalType }}\'s {{ animalAdjective }} fur.',
            'ferocious': 'ran away from the {{ animalType }} quickly.'
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
    var result = run(girlResponseToBunny);
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
    result = run(boyResponseToGrizzly);
    expect(result).to.equal('When he saw the ferocious grizzly he said "Aaaaaahhhhh!" and ' +
      'then ran away from the grizzly quickly.');
  });

  it('Conditionals matching against variables', function () {
    var characterRespondsToAnimal = {
      pronoun: '',
      animalType: '',
      animalAdjective: '',
      animalReference: "{{ animalAdjective }} {{ animalType }}",

      verbalResponse: {
        $branch: {
          $basedOn: 'animalReference',
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
          $basedOn: 'animalReference',
          $if: {
            'fuzzy spider': 'squashed it with a rolled up newspaper',
            'fuzzy puppy': 'sat down on the floor to play with it',
            'ferocious kitten': 'grabbed some string for it to chase',
            'ferocious tiger': 'cowered in fear'
          }
        }
      },
      $return: 'When {{ pronoun }} saw the {{ animalReference }} {{ pronoun }} said "{{ verbalResponse }}" and then {{ actionResponse }}'
    };

    var fuzzySpiderReaction = _.extend(
      _.clone(characterRespondsToAnimal),
      {
        pronoun: 'he',
        animalType: 'spider',
        animalAdjective: 'fuzzy'
      }
    );
    var result = run(fuzzySpiderReaction);
    console.log(result);

    var fuzzyPuppyReaction = _.extend(
      _.clone(characterRespondsToAnimal),
      {
        pronoun: 'he',
        animalType: 'puppy',
        animalAdjective: 'fuzzy'
      }
    );
    result = run(fuzzyPuppyReaction);
    console.log(result);
  });

  it('Simple match should work', function () {
    var song = {
      verses: {
        $for: {
          $index: 'verseNumber',
          $start: 99,
          $end: 0,
          $delta: -1,
          $each: {
            numberOfItems: '{{ @verseNumber }}',
            typeOfItem: {
              $branch: {
                $basedOn: 'numberOfItems',
                $if: {
                  '1': 'bottle of beer',
                  $else: 'bottles of beer'
                }
              }
            },
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

    var result = run(song);
    expect(result).to.be.a('string');
    console.log(result);

    var lines = result.split('\n');
    for(var i = 0; i < 99; i++) {
      var count = 99 - i;
      expect(lines[i]).to.equal(count + ' bottles of beer on the wall, ' + count + ' bottles of beer');
    }
  });
});