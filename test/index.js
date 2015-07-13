// Run the tests in a specific order, from the most basic
// underlying features to the most advanced features. New test
// files should be placed in an order such that all underlying features
// that they depend on are tested prior to the test for that feature running.

// First tests on flat nodes
require('./flat.js');

// Test recursive resolution of nested nodes
require('./nested.js');

// Math nodes
require('./math.js');

// Test simple looping operations
require('./loops.js');

// Test conditional branch operations
require('./conditional-branch.js');