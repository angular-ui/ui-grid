#!/bin/bash

set -e

# Setup and start Sauce Connect for your TravisCI build
# This script requires your .travis.yml to include the following two private env variables:
# SAUCE_USERNAME
# SAUCE_ACCESS_KEY
# Follow the steps at https://saucelabs.com/opensource/travis to set that up.
#
# Curl and run this script as part of your .travis.yml before_script section:
# before_script:
#   - curl https://gist.github.com/santiycr/5139565/raw/sauce_connect_setup.sh | bash

# Skip this if we're on a pull request, we won't be able to connect
if [ $TRAVIS_PULL_REQUEST != "false" ]
then
  exit 0
fi

CONNECT_URL="https://saucelabs.com/downloads/sc-4.4.5-linux.tar.gz"
CONNECT_DIR="/tmp/sauce-connect-$RANDOM"
CONNECT_DOWNLOAD="sc-4.4.5-linux.tar.gz"

if [ -z "$LOGS_DIR" ]
then
  $LOGS_DIR="/tmp/angular-build/logs"
  mkdir -p $LOGS_DIR
fi

CONNECT_LOG="$LOGS_DIR/sauce-connect"
CONNECT_STDOUT="$LOGS_DIR/sauce-connect.stdout"
CONNECT_STDERR="$LOGS_DIR/sauce-connect.stderr"

# Get Connect and start it
mkdir -p $CONNECT_DIR
cd $CONNECT_DIR
wget $CONNECT_URL 1> /dev/null
tar -xvzf $CONNECT_DOWNLOAD --strip 1
rm $CONNECT_DOWNLOAD

# Don't think we need this with a secure env var
# SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`


ARGS=""

# Set tunnel-id only on Travis, to make local testing easier.
if [ ! -z "$TRAVIS_JOB_NUMBER" ]; then
  ARGS="$ARGS --tunnel-identifier $TRAVIS_JOB_NUMBER"
fi
if [ ! -z "$SAUCE_CONNECT_READY_FILE" ]; then
  ARGS="$ARGS --readyfile $SAUCE_CONNECT_READY_FILE"
fi


echo "Starting Sauce Connect in the background, logging into:"
echo "  $CONNECT_LOG"
echo "  $CONNECT_STDOUT"
echo "  $CONNECT_STDERR"
./bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY $ARGS \
  --logfile $CONNECT_LOG &
