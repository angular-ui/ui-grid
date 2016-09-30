'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

// TODO: build tests
exports.fontello = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  options: function(test) {
    // test.expect(1);
    // test.ok(grunt.task.run('fontello'), 'task failed!');
    test.done();
  },
  output: function(test) {
    test.ok(grunt.file.exists(grunt.config('fontello.test.options.config')), 'config file not found.');
    test.done();
  },
};
