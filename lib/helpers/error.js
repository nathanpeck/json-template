// An error helper
module.exports = {
  general: function (scope, error, details) {
    throw new Error('\nError at scope ' + scope + ': \n' +
      error + '\n' +
      JSON.stringify(details, null, 2)
    );
  },

  reference: function (scope, error, details) {
    throw new ReferenceError('\nReference error at scope ' + scope + ': \n' +
      error + '\n' +
      JSON.stringify(details, null, 2)
    );
  },

  syntax: function (scope, error, details) {
    throw new SyntaxError('\nSyntax error at scope ' + scope + ': \n' +
      error + '\n' +
      JSON.stringify(details, null, 2)
    );
  },

  type: function (scope, error, details) {
    throw new TypeError('\nType error at scope ' + scope + ': \n' +
      error + '\n' +
      JSON.stringify(details, null, 2)
    );
  }
};