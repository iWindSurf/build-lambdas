# build-lambdas

![Node.js CI](https://github.com/orangewise/build-lambdas/workflows/Node.js%20CI/badge.svg)
[![npm version][npm-badge]][npm-url]

Utility to build your lambdas in parallel.

- runs `npm install --production` after removing `node_modules` folder
- runs `npm ci --only=production` if there is a package-lock.json
- it can zip your lambdas

## Usage

As a module:
```
```



[npm-badge]: https://badge.fury.io/js/build-lambdas.svg
[npm-url]: https://badge.fury.io/js/build-lambdas
