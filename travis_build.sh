#!/bin/bash

set -e

grunt

# If this is a pull request then we won't have access to secure variables and can't do integration tests with SauceLabs.
#   In this case just do normal local tests
if [ $TRAVIS_PULL_REQUEST != "false" ]
then
  # Do nothing on a pull request. The default task already runs the test:single test
  echo "Do nothing on a pull request, and fill in this space to avoid an error"
else
  grunt test:ci

  # Send coverage data to coveralls.io
  if [ $TRAVIS_BRANCH == "master" ]
  then
    grunt coverage
    cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true
  fi
fi