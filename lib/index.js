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
  * Run a single node in order to resolve all variable references in that node.
  *
  * @param {object} node
  * @param {object} parentNode
  * @returns {string|object}
**/
function runSingleNode(node, parentNode, scope) {
  var operations = {
    $join: require('./operations/join'),
    $branch: require('./operations/branch'),
    $for: require('./operations/for')
  };
  var allOps = _.keys(operations);

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

  // Check to see if this is an operation node.
  for (var op in allOps) {
    var checkingOp = allOps[op];
    var operationNode = node[checkingOp];
    if (operationNode) {
      return operations[checkingOp](operationNode, parentNode, scope + '.' + checkingOp);
    }
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