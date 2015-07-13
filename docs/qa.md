## Q&A

__Q. Does order of keys matter?__

__A.__ No. The engine does a deep inspection of the nodes to gather metadata about their dependencies on each other and then begins making passes over the data structure. On each pass it evaluates all keys that don't have unresolved dependencies.

Basically this means that it doesn't matter if you enter:

```json
{
  "numberOfItems": 99,
  "typeOfItem": "bottles of beer",
  "itemReference": "{{ numberOfItems }} {{ typeOfItem }}",
  "$return": "{{ itemReference }} on the wall, {{ itemReference }}"
}
```

or

```json
{
  "$return": "{{ itemReference }} on the wall, {{ itemReference }}",
  "numberOfItems": 99,
  "itemReference": "{{ numberOfItems }} {{ typeOfItem }}",
  "typeOfItem": "bottles of beer"
}
```

The results will be the same. However, for the sake of the human mind it is still sensible to keep keys in a sensible order rather than randomly mixed up. Additionally, a randomized order may take slightly longer to evaluate, as it will take multiple passes, compared with a properly ordered structure, which will only take one pass to evaluate all keys.

__Q. Why is there no reassignment operator?__

__A.__ Part of this experiment is to see what can be done with a completely immutable language. Therefore by design once a node's variables have been resolved it becomes a static value that cannot be changed ever again. This language is designed to use functional style operations to "sculpt" data from one form to another.

__Q. How sophisticated is the `$math` node?__

__A.__ It can evaluate anything that you can be evaluated with [mathjs](http://mathjs.org/). This gives it some fun features pretty much free out of the box:

```js
var result = engine.evaluate({
  unitConversion: {
    $math: {
      $expression: "5.08 cm to inch"
    }
  },
  fancyMath: {
    $math: {
      $expression: "sqrt(3^2 + 4^2)"
    }
  }
});
console.log(result);
```

```
{ unitConversion: 0.050800000000000005, fancyMath: 5 }
```

__Q. How is the performance?__

__A.__ I haven't optimized anything for performance. Currently it is recalculating dependencies between nodes on each recursion, which is wasteful as it should have the ability to remember deep dependencies that it discovered when evaluating a top level node.

So there are huge potential improvements to be made in performance.