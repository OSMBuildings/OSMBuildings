#!/bin/bash
set -x
set -e # exit with nonzero exit code if anything fails

git config user.name "Travis CI"
git checkout master
git add --force dist/OSMBuildings/*
git commit -m "Distributing a new build"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push "https://${GH_TOKEN}@${GH_REF}" master:master
