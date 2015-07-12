## json-template

This is what happens when [a MongoDB query object](http://docs.mongodb.org/manual/tutorial/query-documents/) and [a handlebars template](http://handlebarsjs.com/) get together and make a baby.

Check out the [examples](docs/examples.md).

#### Why does this exist?

Good question.

1. Because it is possible.
2. Because I was bored.

#### Should I use this in my software project?

Even better question. The following code can help you answer that question:

```js
var run = require('json-template');

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

console.log(run(shouldIUseThis));
```
