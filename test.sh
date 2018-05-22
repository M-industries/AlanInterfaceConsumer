#!/bin/bash
set -e

pushd test >> /dev/null
	npm install ../build/npm
popd >> /dev/null

node node_modules/tslint/lib/tslint-cli.js --project tslint.json test/index.ts
set +e
node node_modules/.bin/tsc -p test >> /dev/null
set -e

node test