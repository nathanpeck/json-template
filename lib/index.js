var Engine = function () {};
module.exports = new Engine();

var _ = require('lodash');

// Dependency analysis, to decide when a node is ready to evaluate.
var dependencies = require('./helpers/dependencies');

// Operation nodes, and their logic.
var nodeOps = {
  $join: require('./nodes/join'),
  $math: require('./nodes/math'),
  $branch: require('./nodes/branch'),
  $for: require('./nodes/for'),
};
var allOpNodeTypes = _.keys(nodeOps);

// Fundamental nodes
var string = require('./nodes/string');

// Helper for outputting error messages.
var error = require('./helpers/error');

/**
  * Evaluate a single node
  *
  * @param {object} node
  * @param {object} parentNode
  * @returns {string|object}
**/
Engine.prototype.evaluate = function (node, parentNode, scope) {
  var self = this;

  if (!_.isObject(parentNode)) {
    parentNode = {};
  }

  if (!scope) {
    scope = 'root';
  }

  // Build dependency index so we can know when subnodes are ready
  // to evaluate.
  var workIndex = dependencies(node, 'root');

  if (node.$workplan) {
    console.log(
      'Scope: ' + scope + '\n',
      'Work Plan: ' + JSON.stringify(workIndex, null, 2) + '\n',
      'Raw Node: ' + JSON.stringify(node, null, 2) + '\n',
      'Parent Node: ' + JSON.stringify(parentNode, null, 2) + '\n'
    );
  }

  // Begin making passes through the node, evaluating all subnodes
  // that don't have unevaluated dependencies that they are waiting for
  while (Object.keys(workIndex).length > 0) {
    // Counter used to detect and break out of conditions in which there are circular
    // dependencies that can not be evaluated.
    var resolvedOnThisPass = 0;

    // Loop through each key in the work index. These are all items
    // that need to be evaluated.
    for (var key in workIndex) {
      var thisKey = workIndex[key];

      // Check to see if this key is still blocked
      var stillBlocked = false;
      for (var blocker in thisKey.waitFor) {
        if (workIndex[thisKey.waitFor[blocker]]) {
          stillBlocked = true;
          break;
        }
      }
      if (stillBlocked) {
        // Just skip to the next item in the work index, because
        // this key is still blocked.
        continue;
      }

      // This key is ready to be evaluated.
      if (thisKey.type === 'string') {
        // Carry all parent references down one scope so that the string
        // evaluator has access to them in its parent scope.
        var parentReferences = _.filter(thisKey.instances, { parent: true });
        for (var ref in parentReferences) {
          var reference = parentReferences[ref].reference;
          if (_.isUndefined(parentNode[reference])) {
            error(
              scope + '.' + key,
              'Reference to key @' + reference + ' at node ' +
              parentReferences[ref].scope + ' could not be located in the parent node',
              parentNode
            );
          }
          else {
            node[reference] = parentNode[reference];
          }
        }

        node[key] = string.evaluate(
          node[key],          // Text node
          node,               // Object node containing it
          scope + '.' + key,  // Name for the text node's scope
          thisKey.instances   // List of variables for the string evaluator to insert
        );
      }
      else if (thisKey.type === 'object') {
        // First check to see if this is an operation node.
        var done = false;
        for (var opIndex in allOpNodeTypes) {
          var typeOfOp = allOpNodeTypes[opIndex];
          if (node[key][typeOfOp]) {
            node[key] = nodeOps[typeOfOp].evaluate(
              node[key][typeOfOp],
              node,
              scope + '.' + key
            );
            done = true;
            break;
          }
        }

        // Evaluate as a recursive structure, since it isn't an op node.
        if (!done) {
          node[key] = self.evaluate(
            node[key],
            node,
            scope + '.' + key
          );
        }
      }

      // This key has been fully evaluated now.
      resolvedOnThisPass++;
      delete workIndex[key];
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
};