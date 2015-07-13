var Operation = function () {};
module.exports = new Operation();

var _ = require('lodash');
var checkNodeParams = require('../helpers/parameters');
var engine = require('../index');
var error = require('../helpers/error');

/**
  * Evaluate a branch node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {string|object}
**/
Operation.prototype.evaluate = function (node, parentNode, scope) {
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
  var subScope;

  if (branchNode) {
    subScope = scope + '.$if.' + testValue;
  }
  else if (node.$if.$else) {
    branchNode = node.$if.$else;
    subScope = scope + '.$if.$else';
  }
  else {
    error(
      scope,
      'Unable to find a matching branch for value \"' + testValue + '\" and there is ' +
      'no $else branch:',
      parentNode
    );
  }

  if (_.isString(branchNode)) {
    // The branch is a plain string
    // Infer a $return inside a sub object
    return engine.evaluate(
      {
        $return: branchNode
      },
      parentNode,
      subScope
    );
  }
  else {
    // The branch is an explicit object, evaluate it as normal.
    return engine.evaluate(branchNode, parentNode, subScope);
  }
};