var Operation = function () {};
module.exports = new Operation();

var checkNodeParams = require('../helpers/parameters');

/**
  * Run a join node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {array} - One item per iteration of the loop
**/
Operation.prototype.evaluate = function(node, parentNode, scope) {
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
};