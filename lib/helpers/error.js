// An error helper
module.exports = function (scope, error, details) {
  throw new Error('\nError at scope ' + scope + ': \n' +
    error + '\n' +
    JSON.stringify(details, null, 2)
  );
};