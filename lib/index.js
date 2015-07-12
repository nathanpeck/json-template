var _ = require('lodash');

/**
  * Build an index of all keys in this node node, and the variables
  * that each depend on.
  *
  * @param {object} node - The node node itself
  * @returns {object} - Index of variable references
**/
function findAllReferences(node) {
  var variableReferences = {};
  var variable = /{{([\s\S]+?)}}/g; // Regex for finding variables in a value

  _.map(node, function (value, key) {
    if (_.isString(value)) {
      var variables = value.match(variable);
      if (variables && variables.length > 0) {
        // Preprocess the variables we found to make things easier later on
        variableReferences[key] = _.map(variables, function (variableInstance) {
          var cleanedInstance = variableInstance;
          cleanedInstance = cleanedInstance.replace('{{', '');
          cleanedInstance = cleanedInstance.replace('}}', '');
          cleanedInstance = cleanedInstance.trim();

          // Check to see if this is variable is a parent reference.
          var referencesParent = false;
          if (cleanedInstance[0] == '@') {
            referencesParent = true;
            // Trim the @ off the front of the variable
            cleanedInstance = cleanedInstance.substr(1);
          }

          return {
            parent: referencesParent,
            dependency: cleanedInstance,
            instance: variableInstance
          };
        });
      }
    }
  });

  return variableReferences;
}

/**
  * Helper to check to ensure that a node has the specified nodes
  * and that the nodes are of the right type.
**/
function checkNodeParams(node, paramDefinition, type, scope) {
  _.each(paramDefinition, function (param) {
    var key = '$' + param.key;
    if (!_.isUndefined(node[key])) {
      if (_.isString(param.test)) {
        if (_[param.test](node[key])) {
          return;
        }
        else {
          throw new Error('Expected node ' + scope + '.' + key + ' to pass test ' + param.test + ':\n' +
            JSON.stringify(node, null, 2));
        }
      }
      else {
        if (_.isArray(param.test)) {
          for (var testIndex in param.test) {
            if (_[param.test[testIndex]](node[key])) {
              return;
            }
          }
          throw new Error('Expected node ' + scope + '.' + key + ' to pass at least one of the ' +
            ' tests ' + JSON.stringify(param.test) + ':\n' + JSON.stringify(node, null, 2));
        }
      }
    }
    else {
      if (param.optional) {
        // Not a big deal, this param was optional anyway.
        return;
      }
      else {
        throw new Error('Expected node ' + scope + ' to have required key ' + key + ':\n' +
          JSON.stringify(node, null, 2));
      }
    }
  });
}

/**
  * Run a loop node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {array} - One item per iteration of the loop
**/
function loop(node, parentNode, scope) {
  // Basic sanity check on the loop params
  checkNodeParams(
    node,
    [
      // The name of the index variable for the loop
      {
        key: 'index',
        test: 'isString'
      },
      // The starting value on the index value
      {
        key: 'start',
        test: 'isNumber'
      },
      // The ending value on the index value
      {
        key: 'end',
        test: 'isNumber'
      },
      // How much the index value changes per iteration
      {
        key: 'delta',
        test: 'isNumber'
      }
    ],
    'loop',
    scope
  );

  var loopIndex = node.$start;
  var loopScope = {};
  var results = [];
  while (loopIndex !== node.$end) {
    loopScope[node.$index] = loopIndex;
    var copy = _.clone(node.$each);
    results.push(
      runSingleNode(
        // The node's $each
        copy,
        // Parent scope, plus the loop index scope
        _.extend(
          parentNode,
          loopScope
        ),
        // A scope name
        scope + '.$each'
      )
    );
    loopIndex += node.$delta;
  }

  return results;
}

/**
  * Run a join node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {array} - One item per iteration of the loop
**/
function join(node, parentNode, scope) {
  // Basic sanity check on the join params
  checkNodeParams(
    node,
    [
      // The target array key to flatten
      {
        key: 'target',
        test: 'isString'
      },
      // Delimiter to put between each array item
      {
        key: 'delimiter',
        test: 'isString'
      }
    ],
    'join',
    scope
  );

  var flattenTarget = node.$target;
  var result = '';
  if (parentNode[flattenTarget]) {
    return parentNode[flattenTarget].join(node.$delimiter);
  }
  else {
    throw new Error('Referenced join target ' + flattenTarget + ' does not exist in ' +
      'parent node ' + scope);
  }
}

/**
  * Run a branch node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {string|object}
**/
function branch(node, parentNode, scope) {
  checkNodeParams(
    node,
    [
      // The key to branch on
      {
        key: 'basedOn',
        test: 'isString'
      },
      // Potential outcomes based on value of branch key
      {
        key: 'if',
        test: 'isObject'
      },
      // If none of the outcomes match
      {
        key: 'else',
        optional: true,
        test: [
          'isObject',
          'isString'
        ]
      }
    ],
    'branch',
    scope
  );

  var testValue = parentNode[node.$basedOn];
  var branchNode = node.$if[testValue];

  if (branchNode) {
    return runSingleNode(branchNode, parentNode, scope + '.$if.' + testValue);
  }
  else if (node.$else) {
    return runSingleNode(node.$else, parentNode, scope + '.$else');
  }
  else {
    throw new Error('Unable to find a matching branch to take when running ' + scope + ':\n ' +
      JSON.stringify(parentNode, null, 2));
  }
}

/**
  * Run a single node in order to resolve all variable references in that node.
  *
  * @param {object} node
  * @param {object} parentNode
  * @returns {string|object}
**/
function runSingleNode(node, parentNode, scope) {
  if (_.isString(node)) {
    // Nothing needs to be resolved in this node
    return node;
  }

  if (!_.isObject(parentNode)) {
    parentNode = {};
  }

  if (!scope) {
    scope = 'root';
  }

  if (node.$for) {
    return loop(node.$for, parentNode, scope + '.$for');
  }

  if (node.$join) {
    return join(node.$join, parentNode, scope + '.$join');
  }

  if (node.$branch) {
    return branch(node.$branch, parentNode, scope + '.$branch');
  }

  // Before this node can be run we must recursively resolve
  // all child nodes.
  var key;
  for (key in node) {
    if (_.isObject(node[key])) {
      node[key] = runSingleNode(node[key], node, scope + '.' + key);
    }
  }

  var toResolve = findAllReferences(node);

  // Make multiple passes, resolving all variable references possible on each pass.
  while (Object.keys(toResolve).length > 0) {
    var resolvedOnThisPass = 0;
    // Loop through each key that contains variables.
    /* jshint forin: false */
    for (key in toResolve) {
      // Loop through each variable reference in this particular key.
      var thisKeysReferences = toResolve[key];
      for (var reference in thisKeysReferences) {
        var thisVariableReference = thisKeysReferences[reference];

        if (thisVariableReference.parent) {
          // This variable points at the parent node.
          if (parentNode[thisVariableReference.dependency]) {
            // And the parent contains this key
            delete thisKeysReferences[reference];
            node[key] = node[key].replace(
              thisVariableReference.instance,
              parentNode[thisVariableReference.dependency]
            );
            resolvedOnThisPass++;
          }
          else {
            // But the parent doesn't actually contain this key
            throw new Error('Key ' + key + ' in scope ' + scope + ' contains parent variable reference to key ' +
              thisVariableReference.dependency + ' but this referenced key does not exist in ' +
              'the parent node');
          }
        }

        if (toResolve[thisVariableReference.dependency]) {
          // The referenced variable points to a key that has unresolved
          // references itself. So leave it for the next pass.
          continue;
        }
        else if (!_.isObject(node[thisVariableReference.dependency])) {
          // The referenced variable points at a value that is ready
          // to use, so replace it.
          delete thisKeysReferences[reference];
          node[key] = node[key].replace(
            thisVariableReference.instance,
            node[thisVariableReference.dependency]
          );
          resolvedOnThisPass++;
          continue;
        }
        else if (_.isObject(node[thisVariableReference.dependency])) {
          throw new Error('Key ' + key + ' in scope ' + scope + ' contains variable reference to key ' +
            thisVariableReference.dependency + ' but this referenced key is an unresolved object: \n\n ' +
            JSON.stringify(node, null, 2)
          );
        }
        else {
          // The reference variable does not exist, and therefore
          // can never be resolved.
          throw new Error('Key ' + key + ' in scope ' + scope + ' contains variable reference to key ' +
            thisVariableReference.dependency + ' but this referenced key does not exist.');
        }
      }

      // Check to see if all the references in this key have been resolved.
      if (Object.keys(thisKeysReferences).length === 0) {
        // Everything in this key has been resolved.
        delete toResolve[key];
      }
    }
    /* jshint forin: true */

    // Verify that we actually resolved a variable on this pass.
    if (resolvedOnThisPass === 0) {
      // We had a pass where there was still stuff to resolve, but we
      // failed to resolve anything at all. Clearly there is some unresolvable
      // circular dependencies.
      throw new Error('Unresolvable circular variable dependencies: ' +
        JSON.stringify(toResolve, null, 2));
    }
  }

  if (node.$return) {
    // This node node specifies an explicit item to return
    return node.$return;
  }
  else {
    // Just return the entire node.
    return node;
  }
}

module.exports = runSingleNode;