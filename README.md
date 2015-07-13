## json-template

This is what happens when [a MongoDB query object](http://docs.mongodb.org/manual/tutorial/query-documents/) and [a handlebars template](http://handlebarsjs.com/) get together and make a baby.

Check out the [examples](docs/examples.md), view the list of [keywords](docs/reserved.md), or read the [Q&A](docs/qa.md).

#### Why does this exist?

Good question.

1. Because it is possible.
2. Because I was bored.

#### Should I use this in my software project?

Even better question. The following code can help you answer that question:

```js
var engine = require('json-template');

var shouldIUseThis = {
  yourInnerCelebrity: 'FILL IN THE BLANK',

  response: {
    $branch: {
      $basedOn: "yourInnerCelebrity",
      $if: {
        'shia labeouf': 'Just do it!',
        'miley cyrus': 'This module is your wrecking ball.',
        'tom cruise': 'Scientology approved!',
        'charlie sheen': 'Doesn\'t matter, either way you\'ll be WINNING!',
        'lady gaga': 'Absolutely!',
      },
      $else: 'Stay far away from this module, for your own safety.'
    }
  },

  $return: 'The answer is: {{ response }}'
};

console.log(engine.evaluate(shouldIUseThis));
```

#### Not scared away yet?

Here is a fizzbuzz implementation:

```js
var fizzbuzz = {
  items: {
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
      $target: 'items',
      $delimiter: ', '
    }
  }
};

console.log(engine.evaluate(fizzbuzz));
```

__Results:__

```
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, Fizzbuzz, 16, 17, Fizz, 19, Buzz, Fizz, 22, 23, Fizz, Buzz, 26, Fizz, 28, 29, Fizzbuzz
```