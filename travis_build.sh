#!/bin/bash

set -e

if [ $JOB = "unit" ]; then
  grunt
  grunt test:ci
  grunt release
elif [ $JOB = "e2e" ]; then
  # grunt clean build test:e2e --browsers=SL_Chrome
else
  echo "Unknown job type. Please set JOB=unit or JOB=e2e."
fi
