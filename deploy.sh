#!/bin/bash

# stop on error
set -e

# publish to npm
cd build/npm
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
npm publish --access public

# tag commit
git tag "${TRAVIS_TAG}"

# push tag
git remote add origin-tagging https://${GITHUB_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git
git push origin-tagging "${TRAVIS_TAG}"
