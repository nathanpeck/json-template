#### Keywords

__Loops:__

- `$for` - Opens a for loop
- `$index` - Sets name of the index variable inside a for loop
- `$start` - Initial value of a loop
- `$end` - Value which will terminate the loop
- `$delta` - Amount by which the index should change each iteration
- `$each` - Node to evaluate per loop

__Math:__

- `$math` - Opens a math node
- `$expression` - Specifies that expression that will be returned as value of the math node.

__Branching logic:__

- `$branch` - Starts a branch
- `$basedOn` - Specifies what variable should be tested against
- `$if` - Dictionaries of value to outcome
- `$else` - Fallback outcome if none of the `$if` values matched

__Evaluation:__

- `$return` - Specifies the value which should be returned from an object subnode

__Array manipulation:__

- `$join` - Opens operation block to join an array
- `$target` - Indiciates target array to operate on
- `$delimiter` - Specifies delimiter to use when joining array

__Debugging:__

- `$workplan` - Causes the core evaluation engine to output its work plan when it reaches the node containing this keyword.
- `$dependencies` - Causes the dependency engine to share its thoughts when it reaches the node containing this keyword.