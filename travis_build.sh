#!/bin/bash

set -e

# If this is a pull request then we won't have access to secure variables and can't do integration tests with SauceLabs.
#   In this case just do normal local tests
if [ $TRAVIS_PULL_REQUEST != "false" ]
then
  # Run default task
  grunt
else
  echo "travis_fold:start:Tests"
  grunt test:ci
  echo "travis_fold:end:Tests"

  # Send coverage data to coveralls.io
  if [ $TRAVIS_BRANCH == "master" ]
  then
    grunt coverage
    cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true
  fi
fi