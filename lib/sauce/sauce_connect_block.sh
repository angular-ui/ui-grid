#!/bin/bash

if [ $TRAVIS_PULL_REQUEST == "false" ]
then
  # Wait for Connect to be ready before exiting
  while [ ! -f $SAUCE_CONNECT_READY_FILE ]; do
    sleep .5
  done
fi