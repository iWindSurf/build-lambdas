#!/bin/bash -e

worklocal=${1:-y}

if [[ ${worklocal} == 'y' ]]; then
  echo
  echo === create link so we can work locally
  chmod +x `pwd`/bin/build-lambdas.js
  (rm node_modules/.bin/build-lambdas &>/dev/null) || true
  ln -s `pwd`/bin/build-lambdas.js node_modules/.bin/build-lambdas
fi
