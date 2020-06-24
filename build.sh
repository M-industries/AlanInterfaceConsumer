#!/bin/bash
npx tsc -p src

rm -fr                        build/npm
cp -r build/js                build/npm
cp    src/LICENSE             build/npm
cp    src/package.json        build/npm
