#!/bin/bash
source ./config.sh

rm -rf $OUTPUT
rm -rf $SC_PATH/*
cd ..
truffle compile
cd wrapper

$WEB3J truffle generate --javaTypes $SC_PATH/CirraviaTravelModel.json -o $OUTPUT -p $PACKAGE