var Operation = function () {};
module.exports = new Operation();

var checkNodeParams = require('../helpers/parameters');
var _ = require('lodash');
var mathjs = require('mathjs');
var engine = require('../index');
var string = require('./string');
var error = require('../helpers/error');

/**
  * Evaluate a math node
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
      // The actual math expression
      {
        key: 'expression',
        test: 'isString'
      }
    ],
    'math',
    scope
  );

  // First evaluate the math expression as a string node in order to
  // turn variable references into their values.
  var expressionBlock;
  if (_.isString(node.$expression)) {
    expressionBlock = {
      $return: node.$expression
    };
  }
  else {
    expressionBlock = node.$expression;
  }

  var mathExpression = engine.evaluate(
    expressionBlock,
    parentNode,
    scope + '.$expression'
  );

  var result;
  try {
    result = mathjs.eval(mathExpression);
  }
  catch (e) {
    error(
      scope + '.$expression',
      'Could not evaluate math expression (' + mathExpression + ') \n' +
      e,
      parentNode
    );
  }

  return result;
};