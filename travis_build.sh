#!/bin/bash

set -e

if [ $JOB = "unit" ]; then
  grunt
  grunt test:ci
elif [ $JOB = "e2e" ]; then
  # grunt clean build test:e2e --browsers=SL_Chrome
  grunt
  grunt test:e2e
else
  echo "Unknown job type. Please set JOB=unit or JOB=e2e."
fi
