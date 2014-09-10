#!/bin/bash

set -e

# NOTE: Travis build matrix won't let us run something after ALL matrix jobs succeed, so we have to run serially (below)
# if [ $JOB = "unit" ]; then
#   grunt
#   grunt test:ci
#   grunt release
# elif [ $JOB = "e2e" ]; then
#   # grunt clean build test:e2e --browsers=SL_Chrome
#   grunt
#   grunt test:e2e:ci
# else
#   echo "Unknown job type. Please set JOB=unit or JOB=e2e."
# fi

grunt
# grunt test:e2e:ci --verbose

# If this is a pull request then we won't have access to secure variables and can't do integration tests with SauceLabs.
#   In this case just do normal local tests
if [ $TRAVIS_PULL_REQUEST ]
then
  grunt test
else
  grunt test:ci

  # Send coverage data to coveralls.io
  if [ $TRAVIS_BRANCH == "master" ]
  then
    grunt coverage
    cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true\
  fi
fi