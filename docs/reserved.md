#### Keywords

__Loops:__

- `$for` - Opens a loop
- `$index` - Sets name of the index variable that can be reference inside loop
- `$start` - Initial value of the index
- `$end` - Value which will terminate the loop
- `$delta` - Amount by which the index should change each iteration
- `$each` - Node to evaluate per iteration

__Math:__

- `$math` - Opens a math node
- `$expression` - Specifies the expression that will be returned as the value of the math node.

__Branching logic:__

- `$branch` - Starts a branch
- `$basedOn` - Specifies what variable should be tested against
- `$if` - Dictionary of value to outcome
- `$else` - Fallback outcome if none of the `$if` values matched

__Evaluation:__

- `$return` - Specifies the value which should be returned from an object subnode

__Array manipulation:__

- `$join` - Opens operation to join an array
- `$target` - Indicates target array to operate on
- `$delimiter` - Specifies delimiter to place between array items when joining them

__Debugging:__

- `$workplan` - Causes the core evaluation engine to output its work plan when it reaches the node containing this keyword.
- `$dependencies` - Causes the dependency engine to share its thoughts when it reaches the node containing this keyword.