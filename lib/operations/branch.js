var operation = {};
module.exports = operation;

var checkNodeParams = require('../helpers/parameters.js');
var runSingleNode = require('../index.js');

/**
  * Run a branch node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {string|object}
**/
operation.evaluate = function (node, parentNode, scope) {
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
};