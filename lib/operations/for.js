var checkNodeParams = require('../helpers/parameters.js');
var _ = require('lodash');
var runSingleNode = require('../index.js');

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

module.exports = loop;