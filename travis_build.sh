#!/bin/bash

set -e

# If this is a pull request then we won't have access to secure variables and can't do integration tests with SauceLabs.
#   In this case just do normal local tests
if [ $TRAVIS_PULL_REQUEST != "false" ]
then
  if [ $JOB == "unit" ]; then
    # Run default task
    grunt
  #elif [ $JOB = "e2e" ]; then
    # Run e2e tests
    # echo "travis_fold:start:Tests"
    # grunt test:ci-e2e
    # echo "travis_fold:end:Tests"
  fi
# Not a pull request, run the full unit test CI suite
else
  echo "travis_fold:start:Tests"
  if [ $JOB = "unit" ]; then
    grunt test:ci
  #elif [ $JOB = "e2e" ]; then
    # grunt test:ci-e2e
  fi
  echo "travis_fold:end:Tests"

  # Send coverage data to coveralls.io
  if [ $TRAVIS_BRANCH == "master" ]
  then
    grunt coverage
    cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true
  fi
fi
