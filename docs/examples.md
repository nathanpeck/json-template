### Basic flat nodes

__Example:__

```js
var run = require('json-template');

var verse = {
  numberOfItems: 99,
  typeOfItem: 'bottles of beer',
  itemReference: '{{ numberOfItems }} {{ typeOfItem }}',
  $return: '{{ itemReference }} on the wall, {{ itemReference }}'
};

console.log(run(verse));
```

__Result:__

```
99 bottles of beer on the wall, 99 bottles of beer
```

### Nested nodes, and references between child and parent

__Example:__

```js
var run = require('json-template');

var song = {
  numberOfItems: 99,
  typeOfItem: 'bottles of beer',
  verse: {
    itemReference: '{{ @numberOfItems }} {{ @typeOfItem }}',
    $return: '{{ itemReference }} on the wall, {{ itemReference }}'
  },
  $return: '{{ song }}'
};

console.log(run(verse));
```

__Result:__

```
99 bottles of beer on the wall, 99 bottles of beer
```

### Conditional branching

__Example:__

```js
var run = require('json-template');

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

console.log(run(girlResponseToBunny));
```

__Result:__

```
When she saw the fluffy bunny she said "Oooh cute!" and then stroked the bunny's fluffy fur.
```

### Basic loops

__Example:__

```js
var run = require('json-template');

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
  }
};

console.log(run(song));
```

__Result:__

```json
{
  "verses": [
    "99 bottles of beer on the wall, 99 bottles of beer"
    "98 bottles of beer on the wall, 98 bottles of beer"
    ...
    "1 bottles of beer on the wall, 1 bottles of beer"
  ]
}
```

### Array flattening

__Example:__

```js
var run = require('json-template');

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

console.log(run(song));
```

__Result:__

```
99 bottles of beer on the wall, 99 bottles of beer
98 bottles of beer on the wall, 98 bottles of beer
...
1 bottles of beer on the wall, 1 bottles of beer
```