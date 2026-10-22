#!/bin/bash

npm install
rm -rf dist/
npm run build
rm -f stop_fraud_thunderbird.xpi
cd dist/
zip -r ../stop_fraud_thunderbird.xpi *

