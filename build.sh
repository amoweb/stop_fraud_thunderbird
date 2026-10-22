#!/bin/bash

npm install
npm run build
rm dist/*.xpi
cd dist/
zip -r ../stop_fraud_thunderbird.xpi *

