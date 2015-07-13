var Operation = function () {};
module.exports = new Operation();

var checkNodeParams = require('../helpers/parameters');
var _ = require('lodash');
var engine = require('../index');

/**
  * Evaluate a loop node
  *
  * @param {object} node
  * @param {object} parentNode
  * @param {text} scope
  * @returns {array} - One item per iteration of the loop
**/
Operation.prototype.evaluate = function (node, parentNode, scope) {
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
    var eachCopy = _.clone(node.$each);
    var parentCopy = _.clone(parentNode);
    parentCopy[node.$index] = loopIndex;

    results.push(
      engine.evaluate(
        eachCopy,          // The node's $each
        parentCopy,        // Copy of the parent scope
        scope + '.$each'   // A scope name
      )
    );
    loopIndex += node.$delta;
  }

  return results;
};