#!/bin/bash

# Note that some npm package leave around .git detritus that will cause problems
# when we go to install the devDependencies. We clean that out here with an 'rm'
# command
cd "$(npm root -g)/tibet" && rm -rf ./node_modules/*/.git/ && npm -g config set user root && npm install
