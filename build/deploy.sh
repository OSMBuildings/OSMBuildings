#!/bin/bash
set -x
set -e

# The purpose of this script is to push generated files to github on 
# a successful build of the master branch

./dist.sh # Build and push the dist directory, which bower depends on
$(dirname $0)/docs.sh # Build docs, and push them to GH pages