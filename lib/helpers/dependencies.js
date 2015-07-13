var _ = require('lodash');

/**
  * Build an index of all keys in this node, and the variables
  * that each depend on. This index is used to ensure that nodes are
  * evaluated in the correct order.
  *
  * @param {object} node - The node node itself
  * @returns {object} - Index of variable references
**/
function findAllReferences(node, scope) {
  var variableReferences = {};
  var variable = /{{([\s\S]+?)}}/g; // Regex for finding variables in a value

  _.map(node, function (value, key) {
    if (_.isString(value)) {
      var variables = value.match(variable);
      if (variables && variables.length > 0) {
        // Preprocess the variables we found to make things easier later on
        var blocks = {};
        var variablesInThisKey = _.map(variables, function (variableInstance) {
          var cleanedInstance = variableInstance;
          cleanedInstance = cleanedInstance.replace('{{', '');
          cleanedInstance = cleanedInstance.replace('}}', '');
          cleanedInstance = cleanedInstance.trim();

          // Check to see if this variable is a reference to a parent property
          var referencesParent = false;
          if (cleanedInstance[0] == '@') {
            referencesParent = true;
            // Trim the @ off the front of the variable
            cleanedInstance = cleanedInstance.substr(1);
          }

          blocks[cleanedInstance] = null;

          return {
            scope: scope + '.' + key,
            parent: referencesParent,
            reference: cleanedInstance,
            instance: variableInstance
          };
        });

        variableReferences[key] = {
          type: 'string',
          waitFor: _.keys(blocks),
          instances: variablesInThisKey
        };
      }
    }
    else if (_.isObject(value)) {
      // Recurse to extract deep properties of this child node that the parent node
      // will be dependent on. Only concerned with parent references though.
      var subNodeVariableIndex = findAllReferences(value, scope + '.' + key);
      var blocking = [];

      for (var subNodeKey in subNodeVariableIndex) {
        var thisKeysDetails = subNodeVariableIndex[subNodeKey];

        for (var subNodeVariable in thisKeysDetails.instances) {
          var thisVariable = thisKeysDetails.instances[subNodeVariable];
          if (thisVariable.parent) {
            // Objects are blocked by the dependencies of any keys inside.
            blocking.push(thisVariable.reference);
          }
        }
      }

      // Index this subnode as being blocked by all the parent references that
      // are contained within it.
      variableReferences[key] = {
        type: 'object',
        waitFor: blocking
      };
    }
  });

  if (node.$dependencies) {
    console.log(
      'Scope: ' + scope + '\n',
      'Dependencies: ' + JSON.stringify(variableReferences, null, 2) + '\n'
    );
  }

  return variableReferences;
}

module.exports = findAllReferences;