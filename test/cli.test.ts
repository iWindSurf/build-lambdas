import * as fs from 'fs'
import * as rimraf from 'rimraf'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

test('build-lambdas run', async () => {
  rimraf.sync('test/fixtures/lambdas/lambda-with-lock-cli/test.zip')

  await exec(`
    bin/build-lambdas.js run \
    -s install,run-build,zip \
    -l test/fixtures/lambdas/lambda-with-lock-cli/ \
    -o test/fixtures/lambdas/lambda-with-lock-cli/test.zip`)
  expect('1').toMatch('1')
  expect(fs.existsSync('test/fixtures/lambdas/lambda-with-lock-cli/test.zip')).toBe(true)
}, 10000)
