var Operation = function () {};
module.exports = new Operation();

var error = require('../helpers/error');
var _ = require('lodash');

/**
  * Evaluate a string node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @param {object} variables
  * @returns string
**/
Operation.prototype.evaluate = function (node, parentNode, scope, variables) {
  for (var variable in variables) {
    var reference = variables[variable].reference;
    if (!_.isUndefined(parentNode[reference])) {
      node = node.replace(
        variables[variable].instance,
        parentNode[reference]
      );
    }
    else {
      error.reference(
        scope,
        'Couldn\'t resolve variable reference ' + reference,
        parentNode
      );
    }
  }

  return node;
};