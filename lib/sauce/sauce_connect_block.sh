#!/bin/bash

if [ $TRAVIS_PULL_REQUEST == "false" ]
then
  # Print connect log to let us know what is going on
  cat $CONNECT_LOG
  # Wait for Connect to be ready before exiting
  while [ ! -f $SAUCE_CONNECT_READY_FILE ]; do
    sleep .5
  done
fi
