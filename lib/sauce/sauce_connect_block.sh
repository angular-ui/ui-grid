#!/bin/bash

if [ $TRAVIS_PULL_REQUEST == "false" ]
then
  # Print connect log to let us know what is going on
  echo Sauce Labs Log
  tail $CONNECT_LOG
  echo Sauce Labs Error Log
  tail $CONNECT_STDERR
  echo Sauce Labs Connect Log
  tail $CONNECT_STDOUT
  # Wait for Connect to be ready before exiting
  while [ ! -f $SAUCE_CONNECT_READY_FILE ]; do
    sleep .5
  done
fi
