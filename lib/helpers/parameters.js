/**
  * Helper to check to ensure that a node has the specified nodes
  * and that the nodes are of the right type.
**/
function checkNodeParams(node, paramDefinition, type, scope) {
  _.each(paramDefinition, function (param) {
    var key = '$' + param.key;
    if (!_.isUndefined(node[key])) {
      if (_.isString(param.test)) {
        if (_[param.test](node[key])) {
          return;
        }
        else {
          throw new Error('Expected node ' + scope + '.' + key + ' to pass test ' + param.test + ':\n' +
            JSON.stringify(node, null, 2));
        }
      }
      else {
        if (_.isArray(param.test)) {
          for (var testIndex in param.test) {
            if (_[param.test[testIndex]](node[key])) {
              return;
            }
          }
          throw new Error('Expected node ' + scope + '.' + key + ' to pass at least one of the ' +
            ' tests ' + JSON.stringify(param.test) + ':\n' + JSON.stringify(node, null, 2));
        }
      }
    }
    else {
      if (param.optional) {
        // Not a big deal, this param was optional anyway.
        return;
      }
      else {
        throw new Error('Expected node ' + scope + ' to have required key ' + key + ':\n' +
          JSON.stringify(node, null, 2));
      }
    }
  });
}